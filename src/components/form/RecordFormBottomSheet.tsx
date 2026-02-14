import { useState, useEffect } from "react";
import {
  Asset, BottomSheet, List, ListRow, Text, Button, Spacing, TextField, useToast,
} from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { useRecordStore } from "../../stores/useRecordStore";
import type { MoneyRecord } from "../../types/record";
import { MODE_LABELS } from "../../constants/category";
import { ProfileImageBottomSheet } from "./ProfileImageBottomSheet";
import { FormAvatar } from "./FormAvatar";
import { FormTypeSelector } from "./FormTypeSelector";
import { FormAdditionalInfo } from "./FormAdditionalInfo";

type IconName = Parameters<typeof Asset.Icon>[0]["name"];

interface Props {
  open: boolean;
  record: MoneyRecord | null;
  onClose: () => void;
  onOpenAmountInput: () => void;
  onHome: () => void;
}

export function RecordFormBottomSheet({ open, record, onClose, onOpenAmountInput, onHome }: Props) {
  const updateRecord = useRecordStore((s) => s.updateRecord);
  const removeRecord = useRecordStore((s) => s.removeRecord);
  const setSelectedRecordId = useRecordStore((s) => s.setSelectedRecordId);
  const editingRecord = useRecordStore((s) => s.editingRecord);
  const setEditingRecord = useRecordStore((s) => s.setEditingRecord);
  const addRecord = useRecordStore((s) => s.addRecord);
  const selectedRecordId = useRecordStore((s) => s.selectedRecordId);
  const setCelebrating = useRecordStore((s) => s.setCelebrating);
  const currentMode = useRecordStore((s) => s.currentMode);

  const labels = MODE_LABELS[currentMode];
  const { openToast } = useToast();

  const [expanded, setExpanded] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isProfilePickerOpen, setIsProfilePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreateMode = selectedRecordId === "new";

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

    const isValid = currentRecord.name.trim() !== "" && currentRecord.type != null && currentRecord.amount > 0;
    if (!isValid) {
      setShowValidationError(true);
      setIsSubmitting(false);
      return;
    }

    const recordToSave = { ...currentRecord, name: currentRecord.name.trim() };

    try {
      if (isCreateMode) {
        await addRecord(recordToSave);
        openToast(labels.addToast);
        setCelebrating(true);
      } else if (record) {
        await updateRecord(record.id, recordToSave);
        openToast(labels.editToast);
      }
      handleClose();
    } catch (error) {
      console.error("저장 실패:", error);
      openToast(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isCreateMode) { handleClose(); return; }
    if (record) {
      try {
        await removeRecord(record.id);
        setSelectedRecordId(null);
        openToast(labels.deleteToast);
        handleClose();
      } catch (error) {
        console.error("삭제 실패:", error);
        openToast(error instanceof Error ? error.message : "삭제에 실패했습니다.");
      }
    }
  };

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} maxHeight={"90vh"}
        header={
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text typography="t4" fontWeight="bold">
              {isCreateMode ? "추가하기" : `${record?.name || "기록"} 정보 수정`}
            </Text>
            <div
              onClick={() => {
                const newStatus = !currentRecord.isFavorite;
                setEditingRecord({ ...currentRecord, isFavorite: newStatus });
                if (!isCreateMode && record) updateRecord(record.id, { isFavorite: newStatus });
              }}
              style={{ cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
            >
              <Asset.Icon name="icon-star-blue" size={24}
                color={currentRecord.isFavorite ? undefined : adaptive.grey300} />
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", height: "65vh", maxHeight: "90vh" }}>
          <div
            style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}
          >
            <Spacing size={10} />
            <FormAvatar iconName={currentRecord.profileIcon} type={currentRecord.type}
              onClick={() => setIsProfilePickerOpen(true)} />
            <Spacing size={2} />
            <List>
              <TextField variant="line" label="이름" labelOption="sustain"
                value={currentRecord.name}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 20);
                  setEditingRecord({ ...currentRecord, name: value });
                }}
                placeholder="누구에게?" hasError={isNameInvalid}
                help={isNameInvalid ? "이름을 입력해주세요" : undefined} maxLength={20}
              />
              <FormTypeSelector value={currentRecord.type}
                onChange={(type) => {
                  if (showValidationError) setShowValidationError(false);
                  setEditingRecord({ ...currentRecord, type });
                }}
              />
              {isTypeInvalid && (
                <div style={{ padding: "6px 20px 0" }}>
                  <Text typography="t7" color={adaptive.red500}>어떤 상황인지 선택해주세요</Text>
                </div>
              )}
              <div className="add-card-pulse">
                <ListRow
                  contents={<ListRow.Texts type="1RowTypeA" top="금액" />}
                  right={
                    currentRecord.amount > 0
                      ? <Text color={adaptive.grey600}>{currentRecord.amount.toLocaleString()}원</Text>
                      : <Text color={adaptive.grey500}>입력하기</Text>
                  }
                  onClick={onOpenAmountInput} arrowType="right"
                />
              </div>
              {isAmountInvalid && (
                <div style={{ padding: "6px 20px 0" }}>
                  <Text typography="t7" color={adaptive.red500}>금액을 입력해주세요</Text>
                </div>
              )}
              <ListRow
                contents={<Text typography="t7" color={adaptive.grey600}>추가 정보 (선택)</Text>}
                verticalPadding="small" arrowType={expanded ? "down" : "right"}
                onClick={() => {
                  const nextExpanded = !expanded;
                  setExpanded(nextExpanded);
                  if (nextExpanded && !currentRecord.date) {
                    setEditingRecord({ ...currentRecord, date: new Date().toISOString().split("T")[0] });
                  }
                }}
              />
              <div onTouchMove={expanded ? (e) => e.stopPropagation() : undefined}>
                <FormAdditionalInfo expanded={expanded} relation={currentRecord.relation} date={currentRecord.date}
                  onRelationChange={(rel) => setEditingRecord({ ...currentRecord, relation: rel })}
                  onDateChange={(val) => setEditingRecord({ ...currentRecord, date: val })}
                />
              </div>
            </List>
          </div>
          <div style={{
            padding: "14px 10px",
            display: "flex", gap: "4px", backgroundColor: "#ffffff",
            borderTop: `1px solid ${adaptive.grey100}`,
          }}>
            <Button style={{ flex: 1 }} variant="weak" size="large" onClick={handleDelete}>삭제</Button>
            <Button style={{ flex: 1 }} variant="fill" size="medium" onClick={handleSave}
              loading={isSubmitting} disabled={isSubmitting}>저장</Button>
          </div>
        </div>
      </BottomSheet>
      <ProfileImageBottomSheet open={isProfilePickerOpen}
        onClose={() => setIsProfilePickerOpen(false)}
        onHome={() => { setIsProfilePickerOpen(false); onHome(); }}
        currentIcon={(currentRecord?.profileIcon?.startsWith("icon-") ? currentRecord.profileIcon : "icon-face-cap") as IconName}
        onSelect={(icon: string) => {
          if (currentRecord) setEditingRecord({ ...currentRecord, profileIcon: icon });
          setIsProfilePickerOpen(false);
        }}
      />
    </>
  );
}
