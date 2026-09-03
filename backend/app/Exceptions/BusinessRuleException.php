<?php

namespace App\Exceptions;

/**
 * Thrown for intentional, user-facing business-rule violations.
 * Extends \LogicException so any legacy catch (\LogicException) still works,
 * but only THIS class's message may be shown to end users — framework
 * LogicExceptions must fall through to the generic error handler.
 */
class BusinessRuleException extends \LogicException
{
}
