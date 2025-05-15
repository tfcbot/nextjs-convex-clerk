/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as competitors from "../competitors.js";
import type * as contentIdeas from "../contentIdeas.js";
import type * as myFunctions from "../myFunctions.js";
import type * as trendingTopics from "../trendingTopics.js";
import type * as users from "../users.js";
import type * as youtubeApi from "../youtubeApi.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  competitors: typeof competitors;
  contentIdeas: typeof contentIdeas;
  myFunctions: typeof myFunctions;
  trendingTopics: typeof trendingTopics;
  users: typeof users;
  youtubeApi: typeof youtubeApi;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
