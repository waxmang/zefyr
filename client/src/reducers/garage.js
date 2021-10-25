import {
  GET_GARAGE,
  GARAGE_ERROR,
  CLEAR_GARAGE,
  GET_ITEMS,
  ITEMS_ERROR,
  CLEAR_ITEMS,
  EDIT_ITEM,
  DELETE_ITEM,
  GET_CATEGORIES,
  CATEGORIES_ERROR,
  EDIT_CATEGORIES,
  EDIT_CATEGORY,
  DELETE_CATEGORY,
} from '../actions/types';

const initialState = {
  garage: null,
  categories: null,
  loading: true,
  error: {},
};

export default function profile(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_GARAGE:
      return {
        ...state,
        garage: payload,
        loading: false,
      };
    case GET_CATEGORIES:
      return {
        ...state,
        categories: payload,
        loading: false,
      };
    case GARAGE_ERROR:
    case CATEGORIES_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case CLEAR_GARAGE:
      return {
        ...state,
        garage: null,
        loading: false,
      };
    case CLEAR_ITEMS:
      return {
        ...state,
        categories: null,
        loading: false,
      };
    case EDIT_ITEM: {
      const category = state.categories.find(
        (category) => category._id === payload.item.category
      );

      const newItems = [...category.items];
      const index = newItems.indexOf(
        newItems.find((item) => item._id === payload.item._id)
      );
      newItems.splice(index, 1, payload.item);

      const newCategory = { ...category, items: newItems };
      const newCategories = [...state.categories];
      newCategories.splice(newCategories.indexOf(category), 1, newCategory);

      return { ...state, categories: newCategories };
    }
    case DELETE_ITEM: {
      const category = state.categories.find(
        (category) => category._id === payload.item.category
      );

      const newItems = [...category.items];
      newItems.splice(newItems.indexOf(payload.item), 1);

      const newCategory = { ...category, items: newItems };
      const newCategories = [...state.categories];
      newCategories.splice(newCategories.indexOf(category), 1, newCategory);

      return { ...state, categories: newCategories };
    }
    case EDIT_CATEGORY: {
      const newCategories = [...state.categories];
      const index = newCategories.indexOf(
        newCategories.find((category) => category._id === payload.category._id)
      );

      newCategories.splice(index, 1, payload.category);

      return { ...state, categories: newCategories };
    }
    case DELETE_CATEGORY: {
      const newCategories = [...state.categories];
      const index = state.categories.indexOf(
        state.categories.find(
          (category) => category._id === payload.category._id
        )
      );

      newCategories.splice(index, 1);

      return { ...state, categories: newCategories };
    }
    case EDIT_CATEGORIES:
      return { ...state, categories: payload.categories };
    default:
      return state;
  }
}
