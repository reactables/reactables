## Composition with Reactables <a name="reactable-composition">

Beyond creating primitives with `RxBuilder`, Reactables can be combined into new ones.

Two main use cases:  
- Reuse existing functionality.  
- Reactable(s) reacting to changes from another reactables.

Reactables emit:  
- **state updates** via the **state observable** (first item in the [Reactable interface](/reactables/references/core-api/#reactable)).  
- **actions** via the **actions observable** (third item in the [Reactable interface](/reactables/references/core-api/#reactable)).  

Other reactables can subscribe to these events via its `sources` option (see [RxConfig](/reactables/references/core-api#rx-config)).

Example:  

- **`RxAuth`** – handles user login.  
- **`RxProfile`** – loads the user profile after login.  

This forms a **directed acyclic graph (DAG)**: profile management depends on authentication but not vice versa. Both remain reusable, independent units of state logic.  

**DAG flow:** 
RxAuth (login) ──▶ (loginSuccess) ──▶ RxProfile (fetch profile)

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/communication/communication.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>


<br>

**RxAuth**

```typescript
import { Action, RxBuilder } from '@reactables/core';
import { Observable, switchMap, of, delay } from 'rxjs';

export const RxAuth = () =>
  RxBuilder({
    initialState: {
      loggingIn: false,
      loggedIn: false,
      userId: null as number | null,
    },
    reducers: {
      login: {
        reducer: (state) => ({
          ...state,
          loggingIn: true,
        }),
        effects: [
          (login$: Observable<Action>) =>
            login$.pipe(
              switchMap(() =>
                // Simulate API call for logging in
                of({ type: 'loginSuccess', payload: { userId: 123 } }).pipe(
                  delay(500)
                )
              )
            ),
        ],
      },
      loginSuccess: (state, action: Action<{ userId: number }>) => ({
        ...state,
        loggedIn: true,
        userId: action.payload.userId,
        loggingIn: false,
      }),
    },
  });

```

**RxProfile**
```typescript
import { Action, RxBuilder } from '@reactables/core';
import { Observable, switchMap, of, delay } from 'rxjs';
type UserProfile = {
  userId: number;
  userName: string;
  email: string;
};

export const RxProfile = ({
  sources,
}: {
  sources: Observable<Action<any>>[];
}) =>
  RxBuilder({
    initialState: {
      fetchingProfile: false,
      userProfile: null as null | UserProfile,
    },
    sources,
    reducers: {
      fetchProfile: {
        reducer: (state, _: Action<number>) => ({
          ...state,
          fetchingProfile: true,
        }),
        effects: [
          (login$: Observable<Action<number>>) =>
            login$.pipe(
              switchMap(({ payload: userId }) =>
                // Simulate API call for fetching user profile
                of({
                  type: 'fetchProfileSuccess',
                  payload: {
                    userId,
                    userName: 'Homer Simpson',
                    email: 'homer@simpson.com',
                  } as UserProfile,
                }).pipe(delay(500))
              )
            ),
        ],
      },
      fetchProfileSuccess: (_, action: Action<UserProfile>) => ({
        fetchingProfile: false,
        userProfile: action.payload,
      }),
    },
  });
```

We can now combine the two and have `RxProfile` listen to `RxAuth`'s actions to detect a `loginSuccess`.

**RxApp** (combining `RxAuth` & `RxProfile`)
```typescript
import { combine } from '@reactables/core';
import { map } from 'rxjs/operators';
import { RxAuth } from './RxAuth';
import { RxProfile } from './RxProfile';

export const RxApp = () => {
  const rxAuth = RxAuth();
  // Access rxAuth's actions observable
  const [, , authActions$] = rxAuth;

  const fetchProfileOnLoginSuccess$ = authActions$
    // Filter for login success actions
    .ofTypes([authActions$.types.loginSuccess])
    .pipe(
      // Map action to a fetch profile action
      map(({ payload: userId }) => ({
        type: 'fetchProfile',
        payload: userId,
      }))
    );

  const rxProfile = RxProfile({
    // Have RxProfile listen for loginSuccess and fetch profile
    sources: [fetchProfileOnLoginSuccess$],
  });

  return combine({
    auth: rxAuth,
    profile: rxProfile,
  });
};

```
