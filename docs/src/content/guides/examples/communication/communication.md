## Communication Between Reactables

The [composition example](#reactable-composition) shows how one reactable can respond to another’s state.  

Reactables can also emit **actions** through their **actions observable** (the third item in the [Reactable interface](/reactables/references/core-api/#reactable)), which other reactables can subscribe to.  

In the example below, we define two simple reactables:  

- **`RxAuth`** – handles user login.  
- **`RxProfile`** – loads a user profile after a successful login.  

This setup demonstrates a **directed acyclic graph (DAG)**: profile management depends on authentication, but cannot affect it. Both reactables remain reusable and independent units of state logic, usable across different applications.  

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
