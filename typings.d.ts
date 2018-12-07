declare module 'react-native-draggable-flatlist' {
  import { FlatListProps } from 'react-native'

  interface RenderItemProps<T> {
    item: T
    index: number
    move: () => void
    moveEnd: () => void
    isActive: boolean
  }

  interface OnMoveEndProps<T> {
    data: T[]
    to: number
    from: number
    row: T
  }

  export type DraggableFlatListProps<T> = Pick<FlatListProps<T>, Exclude<keyof FlatListProps<T>, 'renderItem'>> & {
    onMoveBegin?: (index: number) => void
    onMoveEnd?: (props: OnMoveEndProps<T>) => void
    renderItem: (props: RenderItemProps<T>) => React.ReactElement<any> | null
    scrollPercent?: number
  }

  export default class DraggableFlatList<T> extends React.Component<DraggableFlatListProps<T>, any> {}
}
