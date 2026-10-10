# MongoDB Atlas credential exposure — response checklist

## Status and immediate action

A MongoDB Atlas connection URI containing a database username and password was committed in `backend/seed.js` and detected by GitHub Secret Scanning. Treat the credential as compromised even after removing it from the current source tree.

**Rotate/revoke the exposed database credential immediately.** Removing a secret from the latest commit does not invalidate it and does not remove it from earlier Git history.

## Rotate in MongoDB Atlas

1. Open the correct Atlas project and go to **Security → Database & Network Access → Database Users**.
2. Select **Edit** for the exposed SCRAM/password database user and set a new, unique, strong password; save the change. Alternatively, create a replacement least-privilege database user, update the app to use it, test it, and then delete the exposed user.
3. Update the backend service's environment variable `MONGO_URI` (or the one actually configured for the service) with a fresh connection string. Enter it in the host's secret/environment settings only—never in source code, screenshots, tickets, or logs.
4. Restart/redeploy the backend and verify health, sign-in, tours, hotels, vehicles, and reservation paths against the database.
5. Review the Atlas project's **Activity Feed**, database audit/logging available for the cluster, recent connection activity, database user privileges, and IP access list for unexpected users, IPs, or operations. Restrict network access to only necessary sources and grant the application user only the permissions it needs.

Official Atlas instructions: https://www.mongodb.com/docs/atlas/security-add-mongodb-users/

## Repository fix made

- Removed the embedded MongoDB connection string from `backend/seed.js`. The script now requires a database URI from an environment variable.
- The sample seeding script deletes records from the Tour, Hotel and Vehicle collections before inserting sample data. It now refuses to run in production and requires the explicit `ALLOW_DESTRUCTIVE_SEED=true` confirmation in a disposable development environment.
- Expanded `.gitignore` to ignore local `.env*` files while allowing committed `.env.example` templates.
- Reduced MongoDB connection failure logging so connection details are not dumped to logs.

## GitHub Secret Scanning alert

After the Atlas password/user has been rotated or revoked and the current source no longer contains the credential, open the GitHub **Security → Secret scanning** alert and close it with the appropriate resolution reason (for example, revoked). Do not mark it resolved before the database credential is invalidated.

GitHub's guidance: https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-secret-scanning-alerts/resolving-alerts

## Important note about Git history

The remediation commit removes the URI from the current tracked file; earlier commits may still contain it. Rotation/revocation is the priority because it invalidates the exposed credential. If you also rewrite history to purge the old string, coordinate with collaborators first: rewriting repository history changes commit IDs and requires affected clones and branches to be reconciled. History cleanup is not a substitute for rotation.
