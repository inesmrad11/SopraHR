package com.soprahr.avancesalairebackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AuthenticationServiceException extends RuntimeException {
    public AuthenticationServiceException(String message) {
        super(message);
    }

    public AuthenticationServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
