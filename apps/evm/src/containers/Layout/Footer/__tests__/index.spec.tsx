import { fireEvent, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { Route } from 'react-router';

import {
  VENUS_DISCORD_URL,
  VENUS_DOC_URL,
  VENUS_FLUX_URL,
  VENUS_GITHUB_URL,
  VENUS_TELEGRAM_URL,
} from 'constants/production';
import { routes } from 'constants/routing';
import { renderComponent } from 'testUtils/render';
import { Footer } from '..';

const interfaceState = vi.hoisted(() => ({ isLite: true, supportsModes: true }));
vi.mock('demo/useInterfaceMode', () => ({ useInterfaceMode: () => interfaceState }));
vi.mock('demo/GlassVersions', () => ({
  GlassVersions: () => <span data-testid="preview-controls" />,
}));
vi.mock('pages/Landing/FooterExplorer', () => ({
  FooterExplorer: () => <footer aria-label="About presentation footer" />,
}));

describe('Footer', () => {
  beforeEach(() => {
    interfaceState.isLite = true;
    interfaceState.supportsModes = true;
  });

  it('renders footer links', () => {
    renderComponent(<Footer />);

    expect(screen.getByText('Documentation')).toHaveAttribute('href', VENUS_DOC_URL);
    expect(screen.getByText('Agent skills')).toHaveAttribute(
      'href',
      expect.stringContaining(routes.skills.path),
    );
    expect(screen.getByText('Privacy policy')).toHaveAttribute(
      'href',
      expect.stringContaining(routes.privacyPolicy.path),
    );
    expect(screen.getByText('Terms of use')).toHaveAttribute(
      'href',
      expect.stringContaining(routes.termsOfUse.path),
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      expect.stringContaining(routes.aboutUs.path),
    );
  });

  it.each(['lite', 'pro', 'classic'])('uses the original compact bar with About in %s', mode => {
    interfaceState.isLite = mode === 'lite';
    interfaceState.supportsModes = mode !== 'classic';
    const ref = createRef<HTMLDivElement>();
    const { container } = renderComponent(<Footer ref={ref} />);
    expect(container.querySelectorAll('.venus-compact-footer')).toHaveLength(1);
    expect(screen.queryByRole('contentinfo', { name: 'About presentation footer' })).toBeNull();
    const navigation = screen.getByRole('navigation', { name: 'Footer' });
    expect(
      within(navigation)
        .getAllByRole('link')
        .map(link => link.textContent),
    ).toEqual(['Documentation', 'Agent skills', 'About', 'Privacy policy', 'Terms of use']);
    expect(screen.getAllByTestId('preview-controls')).toHaveLength(1);
    expect(ref.current?.tagName).toBe('FOOTER');
  });

  it('keeps the existing social destinations and accessible icon labels', () => {
    renderComponent(<Footer />);
    for (const [label, href] of [
      ['Discord', VENUS_DISCORD_URL],
      ['Telegram', VENUS_TELEGRAM_URL],
      ['X', VENUS_FLUX_URL],
      ['GitHub', VENUS_GITHUB_URL],
    ]) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    }
    expect(screen.getByLabelText('Venus token explorer')).toBeTruthy();
  });

  it('opens the existing About route from the new link', () => {
    renderComponent(<Footer />, {
      otherRoutes: <Route path={routes.aboutUs.path} element={<h1>About Venus</h1>} />,
    });
    fireEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(screen.getByRole('heading', { name: 'About Venus' })).toBeTruthy();
  });

  it.each([true, false])('preserves the About presentation footer with isLite=%s', isLite => {
    interfaceState.isLite = isLite;
    const { container } = renderComponent(<Footer />, {
      routerInitialEntries: [`${routes.aboutUs.path}/`],
      routePath: '*',
    });
    expect(screen.getByRole('contentinfo', { name: 'About presentation footer' })).toBeTruthy();
    expect(container.querySelector('.venus-compact-footer')).toBeNull();
    expect(screen.getAllByTestId('preview-controls')).toHaveLength(1);
  });
});
