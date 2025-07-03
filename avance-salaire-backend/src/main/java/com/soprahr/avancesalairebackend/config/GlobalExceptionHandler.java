package com.soprahr.avancesalairebackend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.soprahr.avancesalairebackend.model.response.ErrorResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({
        BadCredentialsException.class,
        UsernameNotFoundException.class,
        AccessDeniedException.class
    })
    public ResponseEntity<ErrorResponse> handleSecurityException(Exception ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
