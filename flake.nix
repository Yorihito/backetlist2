{
  description = "backetlist2 dev shell (Next.js 15 + Firebase)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22          # Next.js 15 / React 19 推奨
            jdk21              # Firebase Emulator 用
            git
            jq
          ];

          shellHook = ''
            echo "backetlist2 dev shell loaded"
            echo "node: $(node --version)"
            echo "npm:  $(npm --version)"
          '';
        };
      });
}
