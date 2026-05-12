import { SHARED_DESKTOP_ACTION_STYLES } from '../styles';

describe('navigation styles', () => {
  it('exports shared desktop action style tokens', () => {
    expect(SHARED_DESKTOP_ACTION_STYLES).toMatchObject({
      color: 'white',
      fontSize: 'md',
      fontWeight: 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      width: 'auto',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    });
  });
});
