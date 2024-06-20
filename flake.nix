{
  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-unstable;

  outputs = { self, nixpkgs, ... }@attrs: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = with nixpkgs.legacyPackages.x86_64-linux; [
        cargo
        rustc
        rustfmt
        bacon
        clippy
        rust-analyzer
        pkg-config
        openssl
      ];
    };
  };
}

