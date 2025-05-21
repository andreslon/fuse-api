import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ 
    description: 'Indicates if the request was successful', 
    example: true 
  })
  success: boolean;

  @ApiProperty({ 
    description: 'A message describing the result', 
    example: 'Report sent successfully to example@email.com' 
  })
  message: string;

  @ApiProperty({ 
    description: 'Timestamp of when the request was processed', 
    example: '2025-05-21T16:04:06.587Z' 
  })
  timestamp: string;

  @ApiProperty({ 
    description: 'A unique ID for the request', 
    example: 'req_1621528906587' 
  })
  requestId: string;
} 