import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'isAlphaNumeric', async: false })
export class IsAlphaNumeric implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return /^[a-zA-Z0-9]+$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} hanya boleh mengandung huruf dan angka`;
  }
}

export function IsAlphaNumericCustom(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphaNumeric,
    });
  };
}
