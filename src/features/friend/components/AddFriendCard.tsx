import { Asset, Text } from "@toss/tds-mobile";
import { adaptive } from "@toss/tds-colors";
import { motion } from "framer-motion";

interface AddFriendCardProps {
  onClick: () => void;
}

export function AddFriendCard({ onClick }: AddFriendCardProps) {
  return (
    <motion.div
      className="add-card-pulse"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(49, 130, 246, 0.04)",
        borderRadius: "24px",
        cursor: "pointer",
        border: `1px solid rgba(49, 130, 246, 0.1)`,
        minHeight: "156px",
        boxShadow: "0 4px 12px rgba(49, 130, 246, 0.05)",
      }}
    >
      <Asset.Icon
        name="icon-plus-circle-mono"
        frameShape={Asset.frameShape.CleanW24}
        color={adaptive.blue600}
        style={{ width: 40, height: 40 }}
      />
      <Text
        typography="t7"
        fontWeight="bold"
        style={{ color: adaptive.blue600, marginTop: "8px" }}
      >
        추가
      </Text>
    </motion.div>
  );
}
