with import <nixpkgs> {};
stdenv.mkDerivation {
  name = "env";

  buildInputs = [
    bashInteractive
    nodejs-10_x
    yarn
  ];
}
