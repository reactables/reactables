## Actions On Component Mount

There are cases where we want actions to occur when a reactable is initialized during the UI component's mount.

In our above [fetching data](#fetching-data) example, the data is only fetched when the user clicks the button. We can make an update so the page fetches data on load.

We can add a **source** observable that emits only one action and completes with rxjs <a href="https://rxjs.dev/api/index/function/of" target="_blank" rel="noreferrer">of</a> function. This action then occurs when the reactable is initialized during component mount.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/examples/actions-on-initialization.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
// ... ///
export const RxFetchData = ({
  dataService,
}: {
  dataService: DataService;
}): FetchDataReactable =>
  RxBuilder({
    initialState,
    sources: [of({type: 'fetch'})] // Add source observable
    reducers: {
      // ... //
    },
  });

```