# React Native Draggable FlatList

![Draggable FlatList demo](https://i.imgur.com/XmUcN4Z.gif)

## Install

1. `npm install react-native-draggable-flatlist` or `yarn add react-native-draggable-flatlist`
2. `import DraggableFlatList from 'react-native-draggable-flatlist'`  

## Api

### Props
All props are spread onto underlying [FlatList](https://facebook.github.io/react-native/docs/flatlist)

Name | Type | Description
:--- | :--- | :---
`data` | Array | Items to be rendered.
`horizontal` | Boolean | Orientation of list.
`renderItem` | Function | `({ item, index, move, moveEnd, isActive }) => <Component />`. Call `move` when the row should become active (in an `onPress`, `onLongPress`, etc). Call `moveEnd` when the gesture is complete (in `onPressOut`).
`keyExtractor` | Function | `(item, index) => string`
`contentContainerStyle` | Object |
`scrollPercent` | Number | Sets where scrolling begins. A value of `5` will scroll up if the finger is in the top 5% of the FlatList container and scroll down in the bottom 5%. 
`onMoveEnd` | Function | `({ data, to, from, row }) => void` Returns updated ordering of `data` 
`onMoveBegin` | Function | `(index) => void` Called when row becomes active.

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

  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    return (
      <TouchableOpacity
        style={{ 
          height: 100, 
          backgroundColor: isActive ? 'blue' : item.backgroundColor,
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onLongPress={move}
        onPressOut={moveEnd}
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
          scrollPercent={5}
          onMoveEnd={({ data }) => this.setState({ data })}
        />
      </View>
    )
  }
}

export default Example
```

