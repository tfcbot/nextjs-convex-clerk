import typeSafeApi from './api';

// This file serves as a wrapper to ensure type safety when using the API
// Instead of using anyApi from the generated file, we'll export our type-safe API

export const api = typeSafeApi;
// For internal use only (can also be restricted if needed)
export const internal = typeSafeApi;