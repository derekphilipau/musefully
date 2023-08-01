class APIConnector {
  constructor() {}

  onResultClick() {
    // optional. Called when a result has been clicked
  }
  onAutocompleteResultClick() {
    // optional. Called when an autocomplete result has been clicked
  }

  async onSearch(requestState, queryConfig) {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestState,
        queryConfig,
      }),
    });
    return response.json();
  }

  async onAutocomplete(requestState, queryConfig) {
    const response = await fetch('api/autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestState,
        queryConfig,
      }),
    });
    return response.json();
  }
}

export default APIConnector;
