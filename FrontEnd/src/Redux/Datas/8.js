// Redux reducer - src/Redux/Datas/reducer.js

// Add these to your existing reducer imports
import {
  CREATE_TEST_ORDER_REQUEST,
  CREATE_TEST_ORDER_SUCCESS,
  CREATE_TEST_ORDER_FAILURE,
  GET_ALL_TEST_ORDERS_REQUEST,
  GET_ALL_TEST_ORDERS_SUCCESS,
  GET_ALL_TEST_ORDERS_FAILURE,
} from "./action";

// Update your initial state to include test orders
const initialState = {
  // ... your existing state
  test_orders: [],
  test_order_loading: false,
  test_order_error: null,
};

// Update your reducer to handle test order actions
const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    // ... your existing cases
    
    case CREATE_TEST_ORDER_REQUEST:
      return {
        ...state,
        test_order_loading: true,
        test_order_error: null,
      };
    
    case CREATE_TEST_ORDER_SUCCESS:
      return {
        ...state,
        test_orders: [...state.test_orders, payload],
        test_order_loading: false,
      };
    
    case CREATE_TEST_ORDER_FAILURE:
      return {
        ...state,
        test_order_loading: false,
        test_order_error: payload,
      };
    
    case GET_ALL_TEST_ORDERS_REQUEST:
      return {
        ...state,
        test_order_loading: true,
        test_order_error: null,
      };
    
    case GET_ALL_TEST_ORDERS_SUCCESS:
      return {
        ...state,
        test_orders: payload,
        test_order_loading: false,
      };
    
    case GET_ALL_TEST_ORDERS_FAILURE:
      return {
        ...state,
        test_order_loading: false,
        test_order_error: payload,
      };
    
    default:
      return state;
  }
};

export default reducer;
