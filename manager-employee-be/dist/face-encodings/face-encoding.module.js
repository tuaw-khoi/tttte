"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceEncodingModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const face_encoding_service_1 = require("./services/face-encoding.service");
const face_encoding_controller_1 = require("./http/controllers/face-encoding.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let FaceEncodingModule = class FaceEncodingModule {
};
exports.FaceEncodingModule = FaceEncodingModule;
exports.FaceEncodingModule = FaceEncodingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, axios_1.HttpModule],
        controllers: [face_encoding_controller_1.FaceEncodingController],
        providers: [face_encoding_service_1.FaceEncodingService],
        exports: [face_encoding_service_1.FaceEncodingService]
    })
], FaceEncodingModule);
//# sourceMappingURL=face-encoding.module.js.map