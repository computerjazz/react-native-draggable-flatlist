# React Native Draggable FlatList

## Install

1. `npm install react-native-draggable-flatlist` or `yarn add react-native-draggable-flatlist`
2. `import DraggableFlatlist from 'react-native-draggable-flatlist'`  

## Api

### DraggableFlatList

Props:
- `data` (Array)
- `renderItem` (Function) `({ item, index, move, moveEnd, isActive }) => <Component />`. Call `move` when the row should become active (in an `onPress`, `onLongPress`, etc). Call `moveEnd` when the gesture is complete (in `onPressOut`).
- `keyExtractor` (Function) `(item, index) => string`
- `contentContainerStyle` (Object)
- `scrollPercent` (Number) Sets where scrolling begins. A value of `5` will scroll up if the finger is in the top 5% of the FlatList container and scroll down in the bottom 5%. 


## Example

```javascript
import React, { Component } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'

const data = [1, 2, 3, 4, 5]

class Example extends Component {
  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    return (
      <TouchableOpacity
        style={{ height: 100, backgroundColor: isActive ? 'red' : 'blue' }}
        onLongPress={move}
        onPressOut={moveEnd}
      >
        <Text>{item}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={data}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `draggable-item-${item}`}
          contentContainerStyle={{ padding: 10 }}
          scrollPercent={5}
        />
      </View>
    )
  }
}

export default Example


```

