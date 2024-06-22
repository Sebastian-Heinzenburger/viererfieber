{
  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-unstable;

  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils, ... }@attrs: 
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
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

  });
}

