import { callAllHandlers, FunctionArguments } from '../utils';

describe('callAllHandlers', () => {
  it('should call each handler in sequence', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();

    const event: FunctionArguments<typeof handler1>[0] = {
      defaultPrevented: false,
    };

    const callHandlers = callAllHandlers(handler1, handler2, handler3);
    callHandlers(event);

    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
    expect(handler3).toHaveBeenCalledWith(event);
  });

  it('should stop calling handlers when defaultPrevented is true', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn(event => {
      event.defaultPrevented = true;
    });
    const handler3 = jest.fn();

    const event: FunctionArguments<typeof handler1>[0] = {
      defaultPrevented: false,
    };

    const callHandlers = callAllHandlers(handler1, handler2, handler3);
    callHandlers(event);

    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
    expect(handler3).not.toHaveBeenCalled();
  });
});
