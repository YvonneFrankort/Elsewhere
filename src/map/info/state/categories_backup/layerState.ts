export interface LayerState {
  visibleLayers: Set<string>;
}

export const initialLayerState: LayerState = {
  visibleLayers: new Set()
};

export type LayerAction =
  | { type: "SHOW_LAYER"; layerId: string }
  | { type: "HIDE_LAYER"; layerId: string }
  | { type: "SET_LAYERS"; layerIds: string[] }
  | { type: "CLEAR_LAYERS" };

export function layerReducer(
  state: LayerState,
  action: LayerAction
): LayerState {
  switch (action.type) {
    case "SHOW_LAYER": {
      const next = new Set(state.visibleLayers);
      next.add(action.layerId);
      return { visibleLayers: next };
    }

    case "HIDE_LAYER": {
      const next = new Set(state.visibleLayers);
      next.delete(action.layerId);
      return { visibleLayers: next };
    }

    case "SET_LAYERS":
      return { visibleLayers: new Set(action.layerIds) };

    case "CLEAR_LAYERS":
      return { visibleLayers: new Set() };

    default:
      return state;
  }
}
