import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

/**
 * Typed dispatch hook bound to the application Redux store.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed selector hook bound to the application Redux root state.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
