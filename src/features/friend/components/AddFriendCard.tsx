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
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        cursor: "pointer",
        border: `1px solid ${adaptive.grey200}`,
        minHeight: "148px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Asset.Icon
        name="icon-plus-circle-mono"
        frameShape={Asset.frameShape.CleanW24}
        color={adaptive.grey600}
        style={{ width: 40, height: 40 }}
      />
      <Text
        typography="t7"
        fontWeight="regular"
        style={{ color: adaptive.grey700, marginTop: "8px" }}
      >
        추가
      </Text>
    </motion.div>
  );
}
