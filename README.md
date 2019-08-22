# React Native Draggable FlatList

A drag-and-drop-enabled FlatList component for React Native.
Fully native interactions powered by [Reanimated](https://github.com/kmagiera/react-native-reanimated) and [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler)

![Draggable FlatList demo](https://i.imgur.com/XmUcN4Z.gif)

## Install
1. Install [reanimated](https://github.com/kmagiera/react-native-reanimated) and [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler)
2. `npm install react-native-draggable-flatlist` or `yarn add react-native-draggable-flatlist`
3. `import DraggableFlatList from 'react-native-draggable-flatlist'`  

## Api

### Props
All props are spread onto underlying [FlatList](https://facebook.github.io/react-native/docs/flatlist)

Name | Type | Description
:--- | :--- | :---
`data` | array | `T[]` Items to be rendered.
`horizontal` | boolean | Orientation of list.
`renderItem` | function | `(params: { item: T, index: number, drag: () => void, isActive: boolean}) => React.ComponentType`. Call `drag` when the row should become active (in an `onLongPress`).
`keyExtractor` | function | `(item: T, index: number) => string` Unique key for each item
`onDragBegin` | function | `(index: number) => void` Called when row becomes active.
`onRelease` | function | `(index: number) => void` Called when active row touch ends.
`onDragEnd` | function | `(params: { data: T[], from: number, to: number }) => void` Called after animation has completed. Returns updated ordering of `data` 
`autoscrollThreshold` | number | Distance from edge of container where list begins to autoscroll when dragging.
`autoscrollSpeed` | number | Determines how fast the list autoscrolls.
`onRef` | function | `(ref: React.RefObject<DraggableFlatList<T>>) => void` Returns underlying Animated FlatList ref.
`animationConfig` | object | `Partial<Animated.SpringConfig>` Configure list animations.

## Example

```javascript
import React, { Component } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'

class Example extends Component {

  state = {
    data: [...Array(20)].map((d, index) => ({
      key: `item-${index}`,
      label: index,
      backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index * 5}, ${132})`,
    }))
  }

  renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={{ 
          height: 100, 
          backgroundColor: isActive ? 'blue' : item.backgroundColor,
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onLongPress={drag}
      >
        <Text style={{ 
          fontWeight: 'bold', 
          color: 'white',
          fontSize: 32,
        }}>{item.label}</Text>
      </TouchableOpacity>
    )
  }

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
    )
  }
}

export default Example
```

