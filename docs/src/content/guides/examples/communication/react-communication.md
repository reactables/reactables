<a href="https://stackblitz.com/edit/vitejs-vite-ksxbknfu?file=src%2FApp.tsx" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { useReactable } from '@reactables/react';
import { RxApp } from './RxApp';

function App() {
  const [state, actions] = useReactable(RxApp);

  if (!state) return;

  const {
    auth: { loggingIn, loggedIn, userId },
    profile: { fetchingProfile, userProfile },
  } = state;

  return (
    <>
      <div>
        <button onClick={actions.auth.login} disabled={loggingIn}>
          Login
        </button>
        {loggingIn && <div>Logging In</div>}
        {loggedIn && <div>User Id: {userId} logged in.</div>}
        {fetchingProfile && <div>Fetching Profile...</div>}

        {userProfile && (
          <>
            <h3>Hello {userProfile.userName}</h3>
          </>
        )}
      </div>
    </>
  );
}

export default App;

```