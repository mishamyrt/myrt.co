---
title: 'RESToring an API'
publishedAt: '03.08.2026'
description: 'My take on what a good HTTP API should look like'
tags: []
---

Moving between projects, I keep seeing the same mistakes in REST API design — most of them easy to avoid. This article is my attempt to put into words what I think a good REST API should look like.

If none of this is new to you and this is how you’ve been doing things all along, you’re doing great. Keep it up.

## Why bother?

If a project has a single full-stack developer doing both the frontend and the backend, there may not be much reason to care.

But once several developers are involved — especially when new people regularly join the team — a consistent and predictable REST API makes both development and onboarding considerably easier.

## Resources

A resource is something the frontend, or any other API consumer, wants to retrieve or manipulate. It is the basic building block of REST.

Resource names should be plural nouns whenever multiple instances of that resource can exist. Keep names short and obvious — ideally a single word, without abbreviations or acronyms.

If you really need several words to make the meaning unambiguous, separate them with a delimiter such as a hyphen or underscore. This lets you keep URLs lowercase, which makes them easier to read and avoids ambiguity around capitalization.

| Bad                | Good                  |
| ------------------ | --------------------- |
| `license`          | `licenses`            |
| `individualentity` | `individuals`         |
| `map-coordinate`   | `coordinates`         |
| `competencyMatrix` | `competency-matrices` |

## Domains

A domain is a top-level resource. If one resource belongs to another, reflect that relationship in the URL hierarchy.

If several endpoints share the same prefix, that is usually a good sign that the repeated part deserves to become its own domain.

| Bad                      | Good                      |
| ------------------------ | ------------------------- |
| `/individual/card-block` | `/individuals/card/block` |
| `/individual/card-info`  | `/individuals/card/info`  |

## Parameters

Requests use parameters either to address a specific resource or to filter a collection of resources. Parameters can be passed in several places:

- **path parameters** — as part of the resource URL;
- **query parameters** — after the resource URL, following a question mark;
- **request body** — inside the HTTP request itself. Not every method supports this equally well.

Use the same naming convention for all parameter types throughout the API. Frontend developers tend to appreciate `camelCase`.

Parameter names should also be concise. There is usually no reason to repeat the entity name inside the parameter itself.

Path parameters are a good fit for addressing specific resources. Query parameters are better suited for filters and response-format options.

| Bad                                  | Good                            |
| ------------------------------------ | ------------------------------- |
| `/individual/search/{query}`         | `/individuals?q={query}`        |
| `/legal/organizations/type/{type}`   | `/legal/organizations?type=KT`  |

Avoid unnecessary identifiers in the path. If a child resource already has its own globally unique identifier, including the parent’s ID is often redundant. That relationship is probably already stored in the database anyway.

| Bad                                   | Good                 |
| ------------------------------------- | -------------------- |
| `/users/{user_id}/photos/{photo_id}`  | `/photos/{photo_id}` |

## null vs undefined

Don’t confuse the **presence of absence** with the **absence of presence**.

JSON has a `null` value, which explicitly means “there is no value here.” Use `null` when you actually want to clear a field — for example, to remove a user’s email address.

If a field should remain unchanged, don’t send it at all. Omit it from the request instead of assigning any value to it, including `null`.

## Methods

The HTTP method tells you what action is being performed on a resource.

### GET

Reads a resource. GET is both safe and idempotent: repeating the same request should not change server state.

Although HTTP does not outright forbid a request body on GET, its semantics are not generally defined and many servers, frameworks, and intermediaries will not handle it reliably. Use path or query parameters instead.

| Status | When to use it                       |
| ------ | ------------------------------------ |
| 200    | Resource found                       |
| 304    | Resource has not changed since cache |
| 404    | Resource not found                   |

### HEAD

Reads the resource headers. It behaves much like GET, except the server does not return a response body.

HEAD is useful when you want to inspect metadata, estimate the size of a GET response, or simply check whether a resource exists.

| Status | When to use it                       |
| ------ | ------------------------------------ |
| 200    | Resource found                       |
| 304    | Resource has not changed since cache |
| 404    | Resource not found                   |

### POST

Creates a resource or performs some other action that does not map cleanly to one of HTTP’s built-in verbs.

POST is not guaranteed to be idempotent. Repeating the same request may fail, or it may create another resource.

Use the path and request body to pass parameters.

Some companies that take a particularly strict approach to security use POST even for fetching filtered lists, simply to avoid putting personal data into query parameters. Instead, the filters are sent in the request body.

This is often unnecessary because TLS protects the query string while it travels over the network as well. It can still make sense, however, if you are concerned about sensitive parameters leaking into access logs.

POST is also a natural choice for starting asynchronous operations that are later tracked using long polling or a subscription.

| Status | When to use it                  |
| ------ | ------------------------------- |
| 201    | Resource created                |
| 400    | Invalid values were provided    |

### PUT

Fully replaces or updates a resource. PUT is idempotent: repeating the same request should not produce a different result from the first request.

Use the path and request body to pass parameters. PUT is typically used to replace the complete representation of a resource at a known URI.

If an individual field has its own business logic, it can also be modeled as a separate subresource and updated with PUT.

```
PUT /users/{user_id}/status
"active"
```

PUT can also be used for idempotent resource creation. If the client already knows the identifier, it can send a request to `/documents/{id}`. Repeating that request replaces the same resource instead of creating another one.

| Status | When to use it                               |
| ------ | -------------------------------------------- |
| 200    | Resource updated and returned in the body    |
| 204    | Resource updated with no response body       |
| 400    | Invalid values were provided                 |

### PATCH

Partially updates a resource.

PATCH is not necessarily idempotent — that depends on the semantics of the operation. For example, a PATCH request might describe an operation that increments a counter by one. Repeating it would increment the counter again.

Use the path and request body to pass parameters.

```
PATCH /users/{user_id}
{"status":"active"}
```

| Status | When to use it                               |
| ------ | -------------------------------------------- |
| 200    | Resource updated and returned in full        |
| 204    | Resource updated with no response body       |
| 400    | Invalid values were provided                 |

### DELETE

Deletes a resource.

DELETE is considered idempotent. A repeated request may return `404`, `200`, or `204`, but the state of the server should not change further after the resource has already been deleted.

Request bodies on DELETE have roughly the same problem as request bodies on GET: there is no generally defined semantics for them, and support across servers and frameworks is inconsistent. Prefer path and query parameters.

| Status | When to use it                       |
| ------ | ------------------------------------ |
| 200    | Resource deleted                     |
| 204    | Resource deleted with no body        |
| 400    | Invalid values were provided         |

### Naming actions

HTTP methods are already verbs. If the action performed by an endpoint is the same as the HTTP method, adding another verb to the URL is redundant.

| Method | Bad                   | Good          |
| ------ | --------------------- | ------------- |
| POST   | `/users/create`       | `/users`      |
| DELETE | `/deleteNote?id={id}` | `/notes/{id}` |

## Status codes

A status code lets the client make a decision without parsing the response body.

The frontend can use it to decide whether to render data, show a validation error, redirect the user to a login page, and so on.

The first digit tells you the broad class of the result and often gives you a good idea of where the problem is.

You can browse the full collection on [HTTP Cats](https://http.cat). Here I’ll stick to the ones you’re likely to use every day.

| Code | When to use it                                      |
| ---- | --------------------------------------------------- |
| 200  | Successful request with a response body             |
| 201  | A new resource was created                          |
| 202  | A task was accepted for processing                  |
| 204  | Successful request where the status alone is enough |
| 304  | Data has not changed                                |
| 400  | Invalid request parameters                          |
| 401  | User is not authenticated                           |
| 403  | Insufficient permissions                            |
| 404  | Resource not found                                  |
| 409  | State or data conflict                              |
| 422  | Validation error                                    |
| 429  | Rate limit exceeded                                 |
| 500  | Internal server error                               |
| 502  | Upstream service error                              |
| 503  | Service temporarily unavailable                     |
| 504  | Upstream service timeout                            |

Don’t try to use every HTTP status code ever invented. Most APIs are perfectly fine with 10–15 of them.

Consistency matters more than squeezing every possible distinction out of the RFCs.

## Errors

An HTTP status code helps the client decide what to do, but it is usually not enough to understand — or display — the actual problem.

Use a consistent error format that includes, at minimum, a machine-readable error code and a human-readable explanation.

For example:

```json
{
  "code": "invalid_email",
  "message": "..."
}
```

The textual code lets the client distinguish between specific failures hidden behind the same HTTP status.

A `400` tells you that something is wrong with the request. `invalid_email` tells you exactly what.

Error messages should not contain internal implementation details such as raw database errors or stack traces. Apart from being useless to the API consumer, this is unsafe and exposes details about how your backend works.

## Pagination

Pagination is a way to split a collection of resources into smaller chunks and return them page by page.

It becomes useful when the database contains a lot of data while the frontend only needs to display a fraction of it at any given time.

There are two common approaches: **offset pagination** and **cursor pagination**.

### Offset pagination

With offset pagination, the client sends an `offset` — how many items to skip from the beginning of the collection — and a `limit` — how many items to return.

Another common pair is `page` and `pageSize`, which simply moves the offset calculation to the server.

There is no fundamental difference between the two. Use whichever convention fits your API better.

Offset pagination works well when counting the collection is cheap and new items are not being inserted too frequently.

### Cursor pagination

Offset pagination can produce duplicates between pages when the underlying collection changes frequently.

Imagine fetching one page, then having enough new records inserted at the beginning of the list to shift the offsets before you request the next page. Some items from the previous page can now appear again.

Cursor pagination solves this problem.

Instead of saying “skip N records,” the backend returns a batch of items together with a cursor pointing to where the next batch begins. Even if new records appear in the database, that cursor still points to the continuation of the collection you were already reading.

The main downside is that cursor pagination usually does not let you jump directly to an arbitrary page. To reach a particular position, you generally have to follow the cursors through the preceding pages first.
