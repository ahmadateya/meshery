const { createSlice } = require('@reduxjs/toolkit');
export const globalEnvironmentContextSlice = createSlice({
  name: 'globalEnvironmentContext',
  initialState: {
    selectedEnvs: {
      // envId : {
      //   // selectedK8sConnections : [connectionId]
      // }
    },
  },

  reducers: {
    selectEnv: (state, action) => {
      const { environment } = action.payload;
      state.selectedEnvs[environment.id] = {
        ...environment,
        selectedK8sConnections: [],
      };
    },
    unselectEnv: (state, action) => {
      const { envId } = action.payload;
      delete state.selectedEnvs[envId];
    },

    selectK8sConnection: (state, action) => {
      const { envId, connectionId } = action.payload;
      const isEnvSelected = selectIsEnvSelected({ globalEnvironmentContext: state }, envId);
      if (!isEnvSelected) {
        state.selectedEnvs[envId] = {
          selectedK8sConnections: [connectionId],
        };
        return;
      }
      state.selectedEnvs[envId].selectedK8sConnections.push(connectionId);
    },

    unselectK8sConnection: (state, action) => {
      const { envId, connectionId } = action.payload;
      state.selectedEnvs[envId].selectedK8sConnections = state.selectedEnvs[
        envId
      ].selectedK8sConnections.filter((id) => id !== connectionId);
    },
  },
});

export const { selectEnv, unselectEnv, selectK8sConnection, unselectK8sConnection } =
  globalEnvironmentContextSlice.actions;

export const toggleK8sConnection = (envId, connectionId) => (dispatch, getState) => {
  const isSelected = selectIsK8sConnectionSelected(getState(), envId, connectionId);
  if (isSelected) {
    dispatch(unselectK8sConnection({ envId, connectionId }));
  } else {
    dispatch(selectK8sConnection({ envId, connectionId }));
  }
};

export const toggleEnvSelection = (environment) => (dispatch, getState) => {
  const isSelected = selectIsEnvSelected(getState(), environment.id);
  if (isSelected) {
    dispatch(unselectEnv({ envId: environment.id }));
    return;
  }
  dispatch(selectEnv({ environment }));
};

export default globalEnvironmentContextSlice.reducer;

// selectors

const selectIsK8sConnectionSelected = (state, envId, connectionId) => {
  if (!selectIsEnvSelected(state, envId)) {
    return false;
  }
  return state.globalEnvironmentContext.selectedEnvs[envId].selectedK8sConnections.includes(
    connectionId,
  );
};

const selectIsEnvSelected = (state, envId) =>
  Boolean(state.globalEnvironmentContext.selectedEnvs[envId]);

const selectSelectedEnvs = (state) => state.globalEnvironmentContext.selectedEnvs;

const selectSelectedK8sConnections = (state, envId) =>
  state.globalEnvironmentContext.selectedEnvs[envId]?.selectedK8sConnections || [];

const selectAllSelectedK8sConnections = (state) => {
  const selectedEnvs = selectSelectedEnvs(state);
  return Object.values(selectedEnvs).reduce((acc, { selectedK8sConnections }) => {
    return [...acc, ...selectedK8sConnections];
  }, []);
};

export {
  selectIsK8sConnectionSelected,
  selectIsEnvSelected,
  selectSelectedEnvs,
  selectSelectedK8sConnections,
  selectAllSelectedK8sConnections,
};
