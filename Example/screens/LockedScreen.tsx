import React, { useCallback, useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";

import { mapIndexToData } from "../utils";

type Item = ReturnType<typeof mapIndexToData> & { locked: boolean };

const NUM_ITEMS = 100;

const initialData: Item[] = [...Array(NUM_ITEMS)].map((_, index, arr) => ({
  ...mapIndexToData(_, index, arr),
  locked: index % 4 === 0 && index !== 0,
}));

export default function LockedScreen() {
  const [data, setData] = useState(initialData);

  const renderItem = useCallback(
    ({ item, drag, isActive, isLocked }: RenderItemParams<Item>) => {
      return (
        <ScaleDecorator>
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={drag}
            disabled={isActive || isLocked}
            style={[
              styles.rowItem,
              { backgroundColor: isActive ? "blue" : item.backgroundColor },
              isLocked && styles.lockedItem,
            ]}
          >
            <Text style={styles.text}>{item.text}</Text>
            {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
          </TouchableOpacity>
        </ScaleDecorator>
      );
    },
    []
  );

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={({ data }) => setData(data)}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      isItemLocked={(item) => item.locked}
    />
  );
}

const styles = StyleSheet.create({
  rowItem: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lockedItem: {
    opacity: 0.6,
    height: 150,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  lockIcon: {
    fontSize: 20,
  },
});
