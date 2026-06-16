import { useState, useEffect, useRef } from "react";
import {
  Asset,
  BottomSheet,
  List,
  ListRow,
  Text,
  Button,
  Spacing,
  TextField,
  useToast,
} from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useRecordStore } from "../../stores/useRecordStore";
import type { MoneyRecord } from "../../types/record";
import { MODE_LABELS } from "../../constants/category";
import { ProfileImageBottomSheet } from "../../features/friend/components/form/ProfileImageBottomSheet";
import { FormAvatar } from "./FormAvatar";
import { FormTypeSelector } from "./FormTypeSelector";
import { FormAdditionalInfo } from "./FormAdditionalInfo";
import { FeatureHighlight } from "../onboarding/FeatureHighlight";
import type { GuideProps } from "../../hooks/useFeatureGuide";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface Props {
  open: boolean;
  record: MoneyRecord | null;
  onClose: () => void;
  onOpenAmountInput: () => void;
  onHome: () => void;
  guide: GuideProps;
}

export function RecordFormBottomSheet({
  open,
  record,
  onClose,
  onOpenAmountInput,
  onHome,
  guide,
}: Props) {
  const isGuideActive = guide.currentStep !== null;

  // 가이드 활성화 시 바텀시트 드래그를 캡처 단계에서 차단
  const isGuideActiveRef = useRef(isGuideActive);
  isGuideActiveRef.current = isGuideActive;
  const isOpenRef = useRef(open);
  isOpenRef.current = open;

  useEffect(() => {
    // touchmove만 차단하면 드래그는 막히고 탭(클릭)은 허용됨
    const blockDrag = (e: TouchEvent) => {
      if (!isGuideActiveRef.current || !isOpenRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("touchmove", blockDrag, {
      capture: true,
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", blockDrag, { capture: true });
    };
  }, []);

  const updateRecord = useRecordStore((s) => s.updateRecord);
  const removeRecord = useRecordStore((s) => s.removeRecord);
  const setSelectedRecordId = useRecordStore((s) => s.setSelectedRecordId);
  const editingRecord = useRecordStore((s) => s.editingRecord);
  const setEditingRecord = useRecordStore((s) => s.setEditingRecord);
  const addRecord = useRecordStore((s) => s.addRecord);
  const selectedRecordId = useRecordStore((s) => s.selectedRecordId);
  const setCelebrating = useRecordStore((s) => s.setCelebrating);
  const currentMode = useRecordStore((s) => s.currentMode);
  const recordsCount = useRecordStore((s) => s.records.length);

  const labels = MODE_LABELS[currentMode];
  const { openToast } = useToast();

  const [expanded, setExpanded] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isProfilePickerOpen, setIsProfilePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // 검증 실패 시 첫 번째 오류 필드로 스크롤/포커스하기 위한 ref
  const nameFieldRef = useRef<HTMLDivElement>(null);
  const typeFieldRef = useRef<HTMLDivElement>(null);
  const amountFieldRef = useRef<HTMLDivElement>(null);

  const isCreateMode = selectedRecordId === "new";

  useEffect(() => {
    if (!confirmingDelete) return;
    const t = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmingDelete]);

  useEffect(() => {
    if (open && record && !editingRecord) {
      setEditingRecord({ ...record });
    }
    if (!open) {
      setIsSubmitting(false);
      setExpanded(false);
      setShowValidationError(false);
    }
  }, [open, record, editingRecord, setEditingRecord]);

  const handleClose = () => {
    setExpanded(false);
    setShowValidationError(false);
    setIsSubmitting(false);
    setEditingRecord(null);
    setConfirmingDelete(false);
    if (guide.currentStep !== null || guide.isWaitingForForm) {
      guide.skip();
    }
    onClose();
  };

  const currentRecord = editingRecord || record;
  if (!currentRecord) return null;

  const isNameInvalid = showValidationError && currentRecord.name.trim() === "";
  const isTypeInvalid = showValidationError && currentRecord.type == null;
  const isAmountInvalid = showValidationError && currentRecord.amount <= 0;

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isValid =
      currentRecord.name.trim() !== "" &&
      currentRecord.type != null &&
      currentRecord.amount > 0;
    if (!isValid) {
      setShowValidationError(true);
      setIsSubmitting(false);

      // 첫 번째 오류 필드로 부드럽게 스크롤 + 이름 필드면 포커스
      requestAnimationFrame(() => {
        let target: HTMLDivElement | null = null;
        let focusInput = false;
        if (currentRecord.name.trim() === "") {
          target = nameFieldRef.current;
          focusInput = true;
        } else if (currentRecord.type == null) {
          target = typeFieldRef.current;
        } else if (currentRecord.amount <= 0) {
          target = amountFieldRef.current;
        }
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          if (focusInput) {
            const input = target.querySelector("input");
            input?.focus();
          }
        }
      });
      return;
    }

    const recordToSave = { ...currentRecord, name: currentRecord.name.trim() };
    const wasFirst = isCreateMode && recordsCount === 0;

    try {
      if (isCreateMode) {
        await addRecord(recordToSave);
        openToast(
          wasFirst
            ? `${recordToSave.name}님을 기억해둘게요 ✨`
            : labels.addToast,
        );
        setCelebrating(true);
      } else if (record) {
        await updateRecord(record.id, recordToSave);
        openToast(labels.editToast);
      }
      handleClose();
    } catch (error) {
      console.error("저장 실패:", error);
      openToast("저장에 실패했어요. 잠시 후 다시 시도해주세요");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isCreateMode) {
      handleClose();
      return;
    }
    if (!record) return;

    if (!confirmingDelete) {
      setConfirmingDelete(true);
      openToast("한 번 더 탭하면 삭제돼요");
      return;
    }

    try {
      await removeRecord(record.id);
      setSelectedRecordId(null);
      openToast(labels.deleteToast);
      handleClose();
    } catch (error) {
      console.error("삭제 실패:", error);
      openToast("삭제에 실패했어요. 잠시 후 다시 시도해주세요");
      setConfirmingDelete(false);
    }
  };

  return (
    <>
      <BottomSheet
        open={open}
        onClose={handleClose}
        maxHeight={"90vh"}
        header={
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text typography="t4" fontWeight="bold">
              {isCreateMode
                ? `${currentMode === "paid" ? "보낸 마음" : "받은 마음"} 추가하기`
                : `${record?.name || "기록"} 정보 수정`}
            </Text>
            <div
              role="button"
              aria-label={
                currentRecord.isFavorite ? "중요 표시 해제" : "중요 표시"
              }
              onClick={() => {
                if (isGuideActive) return;
                const newStatus = !currentRecord.isFavorite;
                setEditingRecord({ ...currentRecord, isFavorite: newStatus });
                if (!isCreateMode && record)
                  updateRecord(record.id, { isFavorite: newStatus });
              }}
              style={{
                cursor: "pointer",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "-10px",
              }}
            >
              <Asset.Icon
                name="icon-star-blue"
                size={24}
                color={currentRecord.isFavorite ? undefined : adaptive.grey300}
              />
            </div>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "65vh",
            maxHeight: "90vh",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: isGuideActive ? "hidden" : "auto",
              WebkitOverflowScrolling: isGuideActive ? undefined : "touch",
            }}
          >
            <Spacing size={10} />
            <FormAvatar
              iconName={currentRecord.profileIcon}
              type={currentRecord.type}
              onClick={() => {
                if (!isGuideActive) setIsProfilePickerOpen(true);
              }}
            />
            <Spacing size={2} />
            <List>
              <div ref={nameFieldRef}>
                <FeatureHighlight
                  step="form-all"
                  currentStep={guide.currentStep}
                  onNext={guide.next}
                  onSkip={guide.skip}
                >
                  <TextField
                    variant="line"
                    label="이름"
                    labelOption="sustain"
                    value={currentRecord.name}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 20);
                      setEditingRecord({ ...currentRecord, name: value });
                    }}
                    placeholder="누구에게?"
                    hasError={isNameInvalid}
                    help={isNameInvalid ? "이름을 입력해주세요" : undefined}
                    maxLength={20}
                  />
                </FeatureHighlight>
              </div>
              <div ref={typeFieldRef}>
                <FormTypeSelector
                  value={currentRecord.type}
                  onChange={(type) => {
                    if (showValidationError) setShowValidationError(false);
                    setEditingRecord({ ...currentRecord, type });
                  }}
                />
                {isTypeInvalid && (
                  <div style={{ padding: "6px 20px 0" }}>
                    <Text typography="t7" color={adaptive.red500}>
                      어떤 상황인지 선택해주세요
                    </Text>
                  </div>
                )}
              </div>
              <div ref={amountFieldRef} className="add-card-pulse">
                <ListRow
                  contents={<ListRow.Texts type="1RowTypeA" top="금액" />}
                  right={
                    currentRecord.amount > 0 ? (
                      <Text color={adaptive.grey600}>
                        {currentRecord.amount.toLocaleString()}원
                      </Text>
                    ) : (
                      <Text color={adaptive.grey500}>입력하기</Text>
                    )
                  }
                  onClick={isGuideActive ? undefined : onOpenAmountInput}
                  arrowType="right"
                />
              </div>
              {isAmountInvalid && (
                <div style={{ padding: "6px 20px 0" }}>
                  <Text typography="t7" color={adaptive.red500}>
                    금액을 입력해주세요
                  </Text>
                </div>
              )}
              <ListRow
                contents={
                  <Text typography="t7" color={adaptive.grey600}>
                    추가 정보 (선택)
                  </Text>
                }
                verticalPadding="small"
                arrowType={expanded ? "down" : "right"}
                onClick={
                  isGuideActive
                    ? undefined
                    : () => {
                        setExpanded(!expanded);
                      }
                }
              />
              <div
                onTouchMove={expanded ? (e) => e.stopPropagation() : undefined}
              >
                <FormAdditionalInfo
                  expanded={expanded}
                  relation={currentRecord.relation}
                  date={currentRecord.date}
                  onRelationChange={(rel) =>
                    setEditingRecord({ ...currentRecord, relation: rel })
                  }
                  onDateChange={(val) =>
                    setEditingRecord({ ...currentRecord, date: val })
                  }
                />
              </div>
            </List>
          </div>
          <div
            style={{
              padding: "14px 10px",
              display: "flex",
              gap: "4px",
              backgroundColor: "#ffffff",
              borderTop: `1px solid ${adaptive.grey100}`,
              ...(isGuideActive
                ? { pointerEvents: "none" as const, opacity: 0.4 }
                : {}),
            }}
          >
            {!isCreateMode && (
              <Button
                style={{ flex: 1 }}
                variant="weak"
                size="large"
                onClick={handleDelete}
              >
                {confirmingDelete ? "정말 삭제하기" : "삭제"}
              </Button>
            )}
            <Button
              style={{ flex: 1 }}
              variant="fill"
              size="medium"
              onClick={handleSave}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              저장
            </Button>
          </div>
        </div>
      </BottomSheet>
      <ProfileImageBottomSheet
        open={isProfilePickerOpen}
        onClose={() => setIsProfilePickerOpen(false)}
        onHome={() => {
          setIsProfilePickerOpen(false);
          onHome();
        }}
        currentIcon={
          (currentRecord?.profileIcon?.startsWith("icon-")
            ? currentRecord.profileIcon
            : "icon-face-cap") as IconName
        }
        onSelect={(icon: string) => {
          if (currentRecord)
            setEditingRecord({ ...currentRecord, profileIcon: icon });
          setIsProfilePickerOpen(false);
        }}
      />
    </>
  );
}
