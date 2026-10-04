import React from "react";
import { Text, View } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import DraggableFlatList from "../src/index";

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// Native gesture recognition is exercised separately on a device.
jest.mock("react-native-gesture-handler", () => ({
  ...jest.requireActual("react-native-gesture-handler"),
  GestureDetector: ({ children }) => children,
}));

jest.mock("react-native", () => {
  const native = jest.requireActual("react-native");
  Object.defineProperty(native, "InteractionManager", {
    configurable: true,
    get() {
      throw new Error(
        "InteractionManager has been removed from react-native core"
      );
    },
  });
  return native;
});

const originalData = [{ id: "a" }, { id: "b" }];
const keyExtractor = (item) => item.id;
const renderItem = ({ item, drag, isActive }) => (
  <View onLongPress={drag}>
    <Text>{item.id}</Text>
    {isActive && <Text>Active {item.id}</Text>}
  </View>
);

function List(props) {
  return (
    <DraggableFlatList
      data={originalData}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      {...props}
    />
  );
}

describe("data updates without InteractionManager", () => {
  let callbacks;
  let frameSpy;

  beforeEach(() => {
    callbacks = [];
    frameSpy = jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((cb) => {
        callbacks.push(cb);
        return callbacks.length;
      });
  });

  afterEach(() => {
    frameSpy.mockRestore();
  });

  test.each([
    ["reorder", [...originalData].reverse()],
    ["append", [...originalData, { id: "c" }]],
    ["remove", originalData.slice(1)],
    ["clear", []],
  ])("defers reset after %s without using the removed API", (_, data) => {
    const { rerender } = render(<List />);
    frameSpy.mockClear();
    callbacks = [];
    expect(() => rerender(<List data={data} />)).not.toThrow();
    expect(frameSpy).toHaveBeenCalledTimes(1);
    act(() => callbacks.forEach((callback) => callback(0)));
  });

  test("does not reset for a new array with unchanged keys", () => {
    const { rerender } = render(<List />);
    frameSpy.mockClear();
    rerender(<List data={originalData.map((item) => ({ ...item }))} />);
    expect(frameSpy).not.toHaveBeenCalled();
  });

  test("can start another drag after updated data resets the active row", () => {
    const onDragBegin = jest.fn();
    const { getByText, queryByText, rerender } = render(
      <List onDragBegin={onDragBegin} />
    );
    fireEvent(getByText("a"), "longPress");
    expect(getByText("Active a")).toBeDefined();
    rerender(
      <List data={[...originalData].reverse()} onDragBegin={onDragBegin} />
    );
    act(() => callbacks.forEach((callback) => callback(0)));
    expect(queryByText("Active a")).toBeNull();
    fireEvent(getByText("b"), "longPress");
    expect(onDragBegin).toHaveBeenLastCalledWith(0);
    expect(getByText("Active b")).toBeDefined();
  });
});
