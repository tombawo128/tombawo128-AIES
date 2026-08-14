import React from 'react';
import { Logo } from '../../components/Logo';

export const Legal: React.FC<{ terms?: boolean }> = ({ terms = false }) => (
  <div className="legal">
    <Logo />
    <article>
      <p className="eyebrow">AIES</p>
      <h1>{terms ? 'Terms & Conditions' : 'Privacy Policy'}</h1>
      <p className="muted">Last updated August 10, 2026</p>
      {terms ? (
        <>
          <h2>Use of the service</h2>
          <p>AIES provides tools for internship discovery, applications, supervision, reporting and evaluation. Users are responsible for information they submit and for using the platform lawfully.</p>
          <h2>Accounts</h2>
          <p>Keep account credentials private and provide accurate information. Access may be restricted when an account is inactive or misused.</p>
          <h2>Internship information</h2>
          <p>Listings and application records should be reviewed by the relevant organizations and institutions before decisions are made.</p>
          <h2>Service limitations</h2>
          <p>This project uses a local demo data layer. Production deployments require secure server-side authentication, a database, file storage and appropriate operational controls.</p>
          <h2>Changes</h2>
          <p>These terms may be updated as the service evolves.</p>
        </>
      ) : (
        <>
          <h2>Information collected</h2>
          <p>AIES may store account, profile, internship, application, report and evaluation information needed to operate the platform.</p>
          <h2>How information is used</h2>
          <p>Information is used to support internship workflows, communication, supervision, reporting and evaluation.</p>
          <h2>Demo storage</h2>
          <p>This version stores data in the browser using localStorage. It should not be used to store sensitive production information.</p>
          <h2>Security</h2>
          <p>A production implementation should use secure authentication, server-side authorization, encrypted transport and appropriate data retention controls.</p>
          <h2>Contact</h2>
          <p>For this demo, contact the AIES project administrator through the deployment's configured support channel.</p>
        </>
      )}
      <a href="/login" className="small">
        Back to AIES
      </a>
    </article>
  </div>
);