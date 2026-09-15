export type HostedGoogleReadiness = {
  status: 'READY_FOR_FLOW_TEST' | 'EXTERNAL_BLOCKED';
  googleEnabled: boolean;
  emailEnabled: boolean;
  signupAvailable: boolean;
};

export function hostedGoogleReadiness(value: unknown): HostedGoogleReadiness {
  const settings = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const external = settings.external && typeof settings.external === 'object'
    ? settings.external as Record<string, unknown>
    : {};
  const googleEnabled = external.google === true;
  const emailEnabled = external.email === true;
  const signupAvailable = settings.disable_signup !== true;
  return {
    status: googleEnabled && signupAvailable ? 'READY_FOR_FLOW_TEST' : 'EXTERNAL_BLOCKED',
    googleEnabled,
    emailEnabled,
    signupAvailable,
  };
}
