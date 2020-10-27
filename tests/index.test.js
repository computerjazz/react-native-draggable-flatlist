import React, { useState } from "react";
import { Text, View } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import DraggableFlatList from "../src/index";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

const DummyFlatList = props => {
  const [data, setData] = useState([
    { id: "1", name: "item 1" },
    { id: "2", name: "item 2" }
  ]);

  return (
    <DraggableFlatList
      keyExtractor={item => item.id}
      renderItem={({ item, drag }) => (
        <View onLongPress={drag}>
          <Text>{item.name}</Text>
        </View>
      )}
      testID="draggable-flat-list"
      data={data}
      {...props}
    />
  );
};

describe("DraggableFlatList", () => {
  const setup = propOverrides => {
    const defaultProps = {
      ...propOverrides
    };

    return render(<DummyFlatList {...defaultProps} />);
  };

  it("calls onDragBegin with the index of the element when the drag starts", () => {
    const mockOnDragBegin = jest.fn();
    const { getByText } = setup({ onDragBegin: mockOnDragBegin });

    fireEvent(getByText("item 1"), "longPress");

    expect(mockOnDragBegin).toHaveBeenCalledWith(0);
  });

  it("renders a placeholder when renderPlaceholder is defined", () => {
    const renderPlaceholder = () => <View testID="some-placeholder" />;
    const { getByText, getByTestId } = setup({
      renderPlaceholder: renderPlaceholder
    });

    fireEvent(getByText("item 1"), "longPress");

    expect(getByTestId("some-placeholder")).toBeDefined();
  });
});
