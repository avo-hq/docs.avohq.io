# Internals

This section documents on how we think about the internals of Avo and hwo much you could/should hook into them to extend it.

### Public Methods and Internal Usage

Not all public methods within the Avo codebase are meant for direct user consumption. Some methods are publicly accessible but primarily intended for internal use by various components of the Avo framework itself. This distinction arises due to the complex nature of building a framework or an ecosystem of gems, where numerous moving parts require public interfaces for framework developers rather than for end users.
