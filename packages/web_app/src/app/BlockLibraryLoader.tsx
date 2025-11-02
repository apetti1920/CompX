/**
 * BlockLibraryLoader Component
 *
 * Loads blocks from BlockService on mount and populates Redux store
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useBlockLibrary } from '../services/BlockService';
import { LoadLibraryBlocksAction } from '../store/actions/graphactions';

/**
 * Block library loader component
 *
 * Automatically loads blocks from BlockService and updates Redux store.
 * Should be mounted once at the app root level.
 */
// eslint-disable-next-line import/prefer-default-export
export function BlockLibraryLoader(): null {
  const dispatch = useDispatch();
  const { blocks, loading, error } = useBlockLibrary();

  useEffect(() => {
    if (!loading && !error && blocks.length > 0) {
      dispatch(LoadLibraryBlocksAction(blocks));
    }

    if (error) {
      /* empty */
    }
  }, [blocks, loading, error, dispatch]);

  // This component doesn't render anything
  return null;
}
