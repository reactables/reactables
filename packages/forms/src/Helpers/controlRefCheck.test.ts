import { controlRefCheck } from './controlRefCheck';

describe('controlRefCheck', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    spy?.mockReset();
  });

  it('should warn and offer suggestion', () => {
    controlRefCheck(['hello.hello']);
    expect(spy).toBeCalledWith("You provided ['hello.hello']. Did you mean ['hello', 'hello']?");
  });

  it('should warn and offer suggestion', () => {
    controlRefCheck(['hello.hello', 3, 'my.very.educated.mother']);

    expect(spy).toBeCalledWith(
      "You provided ['hello.hello', 3, 'my.very.educated.mother']. Did you mean ['hello', 'hello', 3, 'my', 'very', 'educated', 'mother']?",
    );
  });

  it('should not throw an error for valid ControlRefs', () => {
    const testFunc = () => {
      controlRefCheck(['hello', 'hello', 2, 'test']);
      controlRefCheck(['hello', 2]);
      controlRefCheck(['hello', 'world']);
      controlRefCheck(['3', 3, 'hello']);
      controlRefCheck([]);
    };

    testFunc();
    expect(spy).not.toBeCalled();
  });
});
