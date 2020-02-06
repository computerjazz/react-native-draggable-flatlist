# React Native Draggable FlatList

A drag-and-drop-enabled FlatList component for React Native.<br />
Fully native interactions powered by [Reanimated](https://github.com/kmagiera/react-native-reanimated) and [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler).<br /><br />
To use swipeable list items in a DraggableFlatList see [React Native Swipeable Item](https://github.com/computerjazz/react-native-swipeable-item).

![Draggable FlatList demo](https://i.imgur.com/xHCylq1.gif)

## Install

1. Follow installation instructions for [reanimated](https://github.com/kmagiera/react-native-reanimated) and [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler). RNGH requires you to make changes to `MainActivity.java`. Be sure to [follow all Android instructions!](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html#android)
2. `npm install` or `yarn add` `react-native-draggable-flatlist`
3. `import DraggableFlatList from 'react-native-draggable-flatlist'`

## Api

### Props

All props are spread onto underlying [FlatList](https://facebook.github.io/react-native/docs/flatlist)

| Name                    | Type                                                                                      | Description                                                                                                                                                                        |
| :---------------------- | :---------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                  | `T[]`                                                                                     | Items to be rendered.                                                                                                                                                              |
| `horizontal`            | `boolean`                                                                                 | Orientation of list.                                                                                                                                                               |
| `renderItem`            | `(params: { item: T, index: number, drag: () => void, isActive: boolean}) => JSX.Element` | Call `drag` when the row should become active (i.e. in an `onLongPress` or `onPressIn`).                                                                                           |
| `keyExtractor`          | `(item: T, index: number) => string`                                                      | Unique key for each item                                                                                                                                                           |
| `onDragBegin`           | `(index: number) => void`                                                                 | Called when row becomes active.                                                                                                                                                    |
| `onRelease`             | `(index: number) => void`                                                                 | Called when active row touch ends.                                                                                                                                                 |
| `onDragEnd`             | `(params: { data: T[], from: number, to: number }) => void`                               | Called after animation has completed. Returns updated ordering of `data`                                                                                                           |
| `autoscrollThreshold`   | `number`                                                                                  | Distance from edge of container where list begins to autoscroll when dragging.                                                                                                     |
| `autoscrollSpeed`       | `number`                                                                                  | Determines how fast the list autoscrolls.                                                                                                                                          |
| `onRef`                 | `(ref: React.RefObject<DraggableFlatList<T>>) => void`                                    | Returns underlying Animated FlatList ref.                                                                                                                                          |
| `animationConfig`       | `Partial<Animated.SpringConfig>`                                                          | Configure list animations. See [reanimated spring config](https://github.com/software-mansion/react-native-reanimated/blob/master/react-native-reanimated.d.ts#L112-L120)          |
| `activationDistance`    | `number`                                                                                  | Distance a finger must travel before the gesture handler activates. Useful when using a draggable list within a TabNavigator so that the list does not capture navigator gestures. |
| `layoutInvalidationKey` | `string`                                                                                  | Changing this value forces a remeasure of all item layouts. Useful if item size/ordering updates after initial mount.                                                              |

## Example

```javascript
import React, { Component } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

const exampleData = [...Array(20)].map((d, index) => ({
  key: `item-${index}`, // For example only -- don't use index as your key!
  label: index,
  backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index *
    5}, ${132})`
}));

class Example extends Component {
  state = {
    data: exampleData
  };

  renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 100,
          backgroundColor: isActive ? "blue" : item.backgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
        onLongPress={drag}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 32
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          onDragEnd={({ data }) => this.setState({ data })}
        />
      </View>
    );
  }
}

export default Example;
```
