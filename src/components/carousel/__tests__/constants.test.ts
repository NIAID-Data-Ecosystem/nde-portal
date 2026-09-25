import { TRANSITION_PROPS, PROGRESS_BAR_THRESHOLDS } from '../constants';

describe('Carousel Constants', () => {
  it('has correct transition properties for spring animation', () => {
    expect(TRANSITION_PROPS.spring).toEqual({
      type: 'spring',
      stiffness: 200,
      damping: 60,
      mass: 3,
    });
  });

  it('has correct transition properties for ease animation', () => {
    expect(TRANSITION_PROPS.ease).toEqual({
      type: 'ease',
      ease: 'easeInOut',
      duration: 0.4,
    });
  });

  it('has correct progress bar threshold values', () => {
    expect(PROGRESS_BAR_THRESHOLDS).toEqual({
      SINGLE_ITEM: 10,
      TWO_ITEMS: 18,
      THREE_OR_MORE: 25,
      MIN_WIDTH: 300,
    });
  });

  it('has logical progression in threshold values', () => {
    expect(PROGRESS_BAR_THRESHOLDS.SINGLE_ITEM).toBeLessThan(
      PROGRESS_BAR_THRESHOLDS.TWO_ITEMS,
    );
    expect(PROGRESS_BAR_THRESHOLDS.TWO_ITEMS).toBeLessThan(
      PROGRESS_BAR_THRESHOLDS.THREE_OR_MORE,
    );
  });
});
