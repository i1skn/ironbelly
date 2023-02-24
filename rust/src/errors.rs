use failure::{Backtrace, Context, Fail};
use grin_core::libtx;
use grin_keychain;
use grin_wallet_impls;
use grin_wallet_libwallet;
use grin_wallet_util::OnionV3AddressError;
use std::env;
use std::fmt::{self, Display};

/// Error definition
#[derive(Debug)]
pub struct Error {
    pub inner: Context<ErrorKind>,
}

#[derive(Clone, Eq, PartialEq, Debug, Fail)]
pub enum ErrorKind {
    /// Wallet Error
    #[fail(display = "Wallet Error")]
    WalletError(grin_wallet_impls::Error),

    /// LibTX Error
    #[fail(display = "LibTx Error")]
    LibTX(libtx::Error),

    /// LibWallet Error
    #[fail(display = "LibWallet Error: {}", _1)]
    LibWallet(grin_wallet_libwallet::Error, String),

    /// Keychain error
    #[fail(display = "Keychain error")]
    Keychain(grin_keychain::Error),

    /// Onion V3 Address Error
    #[fail(display = "Onion V3 Address Error")]
    OnionV3Address(OnionV3AddressError),

    /// Wallet seed doesn't exist
    #[fail(display = "Wallet doesn't exist")]
    WalletDoesntExist(),

    /// Wallet cannot be opened
    #[fail(display = "Wallet can not be opened: {}", _0)]
    WalletCannotBeOpened(String),

    /// Config cannot be parsed
    #[fail(display = "Wallet can not be opened: {}", _0)]
    ConfigCannotBeParsed(String),

    /// Error when formatting json
    #[fail(display = "IO error")]
    IO,

    /// Error when formatting json
    #[fail(display = "Serde JSON error")]
    Format,

    /// Other
    #[fail(display = "Generic error: {}", _0)]
    GenericError(String),
}

impl Fail for Error {
    fn cause(&self) -> Option<&dyn Fail> {
        self.inner.cause()
    }

    fn backtrace(&self) -> Option<&Backtrace> {
        self.inner.backtrace()
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let show_bt = match env::var("RUST_BACKTRACE") {
            Ok(r) => r == "1",
            Err(_) => false,
        };
        let backtrace = match self.backtrace() {
            Some(b) => format!("{}", b),
            None => String::from("Unknown"),
        };
        let inner_output = format!("{}", self.inner,);
        let backtrace_output = format!("\nBacktrace: {}", backtrace);
        let mut output = inner_output;
        if show_bt {
            output.push_str(&backtrace_output);
        }
        Display::fmt(&output, f)
    }
}

impl Error {
    /// get kind
    pub fn kind(&self) -> ErrorKind {
        self.inner.get_context().clone()
    }
    /// get cause
    pub fn cause(&self) -> Option<&dyn Fail> {
        self.inner.cause()
    }
    /// get backtrace
    pub fn backtrace(&self) -> Option<&Backtrace> {
        self.inner.backtrace()
    }
}

impl From<ErrorKind> for Error {
    fn from(kind: ErrorKind) -> Error {
        Error {
            inner: Context::new(kind),
        }
    }
}

impl From<Context<ErrorKind>> for Error {
    fn from(inner: Context<ErrorKind>) -> Error {
        Error { inner }
    }
}

impl From<grin_keychain::Error> for Error {
    fn from(error: grin_keychain::Error) -> Error {
        Error {
            inner: Context::new(ErrorKind::Keychain(error)),
        }
    }
}

impl From<grin_wallet_libwallet::Error> for Error {
    fn from(error: grin_wallet_libwallet::Error) -> Error {
        Error {
            inner: Context::new(ErrorKind::LibWallet(error.clone(), format!("{}", &error))),
        }
    }
}

impl From<libtx::Error> for Error {
    fn from(error: libtx::Error) -> Error {
        Error {
            inner: Context::new(ErrorKind::LibTX(error)),
        }
    }
}

impl From<grin_wallet_impls::Error> for Error {
    fn from(error: grin_wallet_impls::Error) -> Error {
        Error {
            inner: Context::new(ErrorKind::WalletError(error)),
        }
    }
}
