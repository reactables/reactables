## Actions On Mount


Sometimes we want a reactable to trigger an action as soon as its component mounts.  

In the [fetching data](#fetching-data) example, data only loads when the user clicks a button. To fetch on page load instead, add a **source** observable that emits a single action on initialization using RxJS [`of`](https://rxjs.dev/api/index/function/of). This ensures the action runs once when the reactable is created. 

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