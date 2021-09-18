# React Native Draggable FlatList

A drag-and-drop-enabled FlatList component for React Native.<br />
Fully native interactions powered by [Reanimated](https://github.com/kmagiera/react-native-reanimated) and [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler).<br /><br />
To use swipeable list items in a DraggableFlatList see [React Native Swipeable Item](https://github.com/computerjazz/react-native-swipeable-item).

![Draggable FlatList demo](https://i.imgur.com/xHCylq1.gif)

## Install

1. Follow installation instructions for [reanimated](https://github.com/kmagiera/react-native-reanimated) and [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler). RNGH requires you to make changes to `MainActivity.java`. Be sure to [follow all Android instructions!](https://docs.swmansion.com/react-native-gesture-handler/docs/#android)
2. Install this package using `npm` or `yarn`

with `npm`:

```
npm install --save react-native-draggable-flatlist
```

with `yarn`:

```
yarn add react-native-draggable-flatlist
```

3. `import DraggableFlatList from 'react-native-draggable-flatlist'`

## Api

### Props

All props are spread onto underlying [FlatList](https://facebook.github.io/react-native/docs/flatlist)

| Name                       | Type                                                                                      | Description                                                                                                                                                                                                        |
| :------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                     | `T[]`                                                                                     | Items to be rendered.                                                                                                                                                                                              |
| `horizontal`               | `boolean`                                                                                 | Orientation of list.                                                                                                                                                                                               |
| `renderItem`               | `(params: { item: T, index: number, drag: () => void, isActive: boolean}) => JSX.Element` | Call `drag` when the row should become active (i.e. in an `onLongPress` or `onPressIn`).                                                                                                                           |
| `renderPlaceholder`        | `(params: { item: T, index: number }) => React.ReactNode`                                 | Component to be rendered underneath the hovering component                                                                                                                                                         |
| `keyExtractor`             | `(item: T, index: number) => string`                                                      | Unique key for each item                                                                                                                                                                                           |
| `onDragBegin`              | `(index: number) => void`                                                                 | Called when row becomes active.                                                                                                                                                                                    |
| `onRelease`                | `(index: number) => void`                                                                 | Called when active row touch ends.                                                                                                                                                                                 |
| `onDragEnd`                | `(params: { data: T[], from: number, to: number }) => void`                               | Called after animation has completed. Returns updated ordering of `data`                                                                                                                                           |
| `autoscrollThreshold`      | `number`                                                                                  | Distance from edge of container where list begins to autoscroll when dragging.                                                                                                                                     |
| `autoscrollSpeed`          | `number`                                                                                  | Determines how fast the list autoscrolls.                                                                                                                                                                          |
| `onRef`                    | `(ref: React.RefObject<DraggableFlatList<T>>) => void`                                    | Returns underlying Animated FlatList ref.                                                                                                                                                                          |
| `animationConfig`          | `Partial<Animated.SpringConfig>`                                                          | Configure list animations. See [reanimated spring config](https://github.com/software-mansion/react-native-reanimated/blob/master/react-native-reanimated.d.ts#L112-L120)                                          |
| `activationDistance`       | `number`                                                                                  | Distance a finger must travel before the gesture handler activates. Useful when using a draggable list within a TabNavigator so that the list does not capture navigator gestures.                                 |
| `layoutInvalidationKey`    | `string`                                                                                  | Changing this value forces a remeasure of all item layouts. Useful if item size/ordering updates after initial mount.                                                                                              |
| `onScrollOffsetChange`     | `(offset: number) => void`                                                                | Called with scroll offset. Stand-in for `onScroll`.                                                                                                                                                                |
| `onPlaceholderIndexChange` | `(index: number) => void`                                                                 | Called when the index of the placeholder changes                                                                                                                                                                   |
| `dragItemOverflow`         | `boolean`                                                                                 | If true, dragged item follows finger beyond list boundary.                                                                                                                                                         |
| `dragHitSlop`              | `object: {top: number, left: number, bottom: number, right: number}`                      | Enables control over what part of the connected view area can be used to begin recognizing the gesture. Numbers need to be non-positive (only possible to reduce responsive area).                                 |
| `debug`                    | `boolean`                                                                                 | Enables debug logging and animation debugger.                                                                                                                                                                      |
| `containerStyle`           | `StyleProp<ViewStyle>`                                                                    | Style of the main component.                                                                                                                                                                                       |
| `simultaneousHandlers`     | `React.Ref<any>` or `React.Ref<any>[]`                                                    | References to other gesture handlers, mainly useful when using this component within a `ScrollView`. See [Cross handler interactions](https://docs.swmansion.com/react-native-gesture-handler/docs/interactions/). |

## Example

Example snack: https://snack.expo.io/@computerjazz/rndfl-example <br />
Example snack with scale effect on hover: https://snack.expo.io/@computerjazz/rndfl-dragwithhovereffect

```typescript
import React, { useState, useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

const NUM_ITEMS = 10;

function getColor(i: number, alpha: number) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgba(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal}, ${alpha})`;
}

const exampleData: Item[] = [...Array(20)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${backgroundColor}`,
    label: String(index),
    backgroundColor
  };
});

type Item = {
  key: string;
  label: string;
  backgroundColor: string;
};

function Example() {
  const [data, setData] = useState(exampleData);

  const renderItem = useCallback(
    ({ item, index, drag, isActive }: RenderItemParams<Item>) => {
      const activeColor = getColor(index, 0.7);
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            height: 100,
            backgroundColor: isActive ? activeColor : item.backgroundColor,
            alignItems: "center",
            justifyContent: "center",
          }}
          onLongPress={drag}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: "white",
              fontSize: 32,
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        onDragEnd={({ data }) => setData(data)}
      />
    </View>
  );
}

export default Example;
```
