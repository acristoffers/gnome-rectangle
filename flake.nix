{
  description = "A Gnome extension to mimic macOS's Rectangle tiling.";

  inputs = {
    nixpkgs.url = github:NixOS/nixpkgs/nixpkgs-unstable;
    flake-utils.url = github:numtide/flake-utils;

    gitignore.url = "github:hercules-ci/gitignore.nix";
    gitignore.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils, gitignore }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        inherit (gitignore.lib) gitignoreSource;
        pkgs = (import nixpkgs) { inherit system; };
        nodejs = pkgs.nodejs;
        node2nixOutput = import ./nix { inherit pkgs nodejs system; };
        nodeDeps = node2nixOutput.nodeDependencies;
        buildDependencies = with pkgs; [
          busybox
          glib
          nodejs
          typescript
          zip
        ];
      in
      {
        formatter = nixpkgs.legacyPackages.${system}.nixpkgs-fmt;
        packages.default = pkgs.stdenv.mkDerivation {
          name = "gnome-extensions-rectangle";
          version = "master";
          src = gitignoreSource ./.;
          nativeBuildInputs = buildDependencies;
          dontCheck = true;
          dontConfigure = true;
          dontFixup = true;
          buildPhase = ''
            runHook preBuild
            ln -sf ${nodeDeps}/lib/node_modules ./node_modules
            make pack
            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall
            mkdir -p $out/share/gnome-shell/extensions/rectangle@acristoffers.me
            unzip rectangle.zip -d $out/share/gnome-shell/extensions/rectangle@acristoffers.me
            cp rectangle.zip $out/
            runHook postInstall
          '';
        };
        devShell = pkgs.mkShell {
          packages = buildDependencies;
        };
      }
    );
}
