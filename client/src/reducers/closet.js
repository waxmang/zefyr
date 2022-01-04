import {
  GET_CLOSET,
  CLOSET_ERROR,
  CLEAR_CLOSET,
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
  closet: null,
  categories: null,
  allItems: null,
  loadingCloset: true,
  loadingCategories: true,
  error: {},
};

export default function profile(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_CLOSET:
      return {
        ...state,
        closet: payload,
        loadingCloset: false,
      };
    case GET_CATEGORIES:
      let allItems = [];
      payload.forEach(
        (category) => (allItems = allItems.concat(category.items))
      );
      return {
        ...state,
        categories: payload,
        allItems: allItems,
        loadingCategories: false,
      };
    case CLOSET_ERROR:
    case CATEGORIES_ERROR:
      return {
        ...state,
        error: payload,
        loadingCloset: false,
        loadingCategories: false,
      };
    case CLEAR_CLOSET:
      return {
        ...state,
        closet: null,
        loadingCloset: false,
      };
    case CLEAR_ITEMS:
      return {
        ...state,
        categories: null,
        loadingCategories: false,
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
