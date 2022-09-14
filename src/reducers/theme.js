import { TOGGLE_DARK_THEME } from '../actions/theme';

const initialState = { dark: true };

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, dark: !state.dark };
    default:
      return state;
  }
};
