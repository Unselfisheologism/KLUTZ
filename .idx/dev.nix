# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "unstable"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    ###### Playwright deps
    # libgobject-2.0.so.0
    # libglib-2.0.so.0
    # libgio-2.0.so.0
    pkgs.glib
    # libnss3.so
    # libnssutil3.so
    # libsmime3.so
    pkgs.nss
    # libnspr4.so
    pkgs.nspr
    # libatk-1.0.so.0
    # libatk-bridge-2.0.so.0
    # libatspi.so.0
    pkgs.at-spi2-core
    # libcups.so.2
    pkgs.cups
    # libdrm.so.2
    pkgs.libdrm
    # libdbus-1.so.3
    pkgs.dbus
    # libX11.so.6
    pkgs.xorg.libX11
    # libXcomposite.so.1
    pkgs.xorg.libXcomposite
    # libXdamage.so.1
    pkgs.xorg.libXdamage
    # libXext.so.6
    pkgs.xorg.libXext
    # libXfixes.so.3
    pkgs.xorg.libXfixes
    # libXrandr.so.2
    pkgs.xorg.libXrandr
    # libgbm.so.1
    pkgs.mesa
    # libexpat.so.1
    pkgs.expat
    # libxcb.so.1
    pkgs.xorg.libxcb
    # libxkbcommon.so.0
    pkgs.libxkbcommon
    # libpango-1.0.so.0
    pkgs.pango
    # libcairo.so.2
    pkgs.cairo
    # libasound.so.2
    pkgs.alsa-lib
    ######
  ];
  # Sets environment variables in the workspace
  env = {
    POLLINATIONS_API_KEY = "8pp_SurhBzcSzNtu";
  };
  # This adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is written into the user's directory
  services.firebase.emulators = {
    detect = true;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
