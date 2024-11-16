import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';

export const ZERO_BYTES = new Bytes(0);

export const ZERO_BI = BigInt.fromString('0');
export const ONE_BI = BigInt.fromString('1');

export const BPS_BI = BigInt.fromString('10000');

export const ZERO_BD = BigDecimal.fromString('0');
export const ONE_BD = BigDecimal.fromString('1');

export const DEFAULT_DECIMALS = BigInt.fromString('18');
export const DECIMALS_6 = BigInt.fromString('6');

export const ERC20_INTERFACE_ID = Bytes.fromHexString('0x36372b07');

export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const NATIVE_ALT = '0x0000000000000000000000000000000000000000';

export const DEFAULT_FEE_AMOUNT_BPS = BigDecimal.fromString('300');
export const BASE_BPS = BigDecimal.fromString('10000');

// V4 Math
export const Q192 = BigInt.fromI32(2).pow(192);

// Time
export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * 60;
export const HOURS_PER_DAY = 24;

// Candor Addresses [BASE SEPOLIA]
export const CANDOR_MANAGER = '0x171e18bC5dcF2bca6AAc9D1bA594c2788e0A1b5e'.toLowerCase(); // replace this
export const CANDOR_HOOK = '0xBAf47560292Ca35c995973d3367F687C6f632D76'.toLowerCase(); // replace this
export const USDC_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
