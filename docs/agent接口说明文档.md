# Agnes-Image-2.0-Flash 接入文档(生图模型)


## 一、模型简介


**Agnes-Image-2.0-Flash** 是由 **Sapiens AI** 开发的一款高性能图像生成与图像编辑模型。


该模型支持 **文生图**、**图生图** 和 **多图合成** 工作流，适用于快速创意生产、图像优化、营销视觉设计、电商产品图、社交内容生成以及专业视觉内容生产等场景。


Agnes-Image-2.0-Flash 已登上 **Artificial Analysis Image Editing Leaderboard**，取得 **ELO 1,184**【动态调整】的成绩，并进入 **Top 20** 区间，展现出在主流图像模型中较强的图像编辑能力。


---


## 二、模型概述


Agnes-Image-2.0-Flash 针对快速、高质量的图像生成与图像编辑任务进行了优化。


该模型支持以下能力：


| 能力                    | 说明                           |
| --------------------- | ---------------------------- |
| Text-to-Image         | 根据文本 Prompt 生成图像             |
| Image-to-Image        | 基于输入图像进行编辑、转换或增强             |
| Multi-Image Input     | 支持输入多张参考图并合成为一张新图像           |
| Image Editing         | 修改构图、风格、对象、背景、场景和视觉细节        |
| Style Control         | 调整艺术风格、光照、布局和视觉方向            |
| Fast Generation       | 针对快速、低成本的生产工作流进行优化           |
| OpenAI-Compatible API | 使用兼容 OpenAI Images API 的请求结构 |


---


## 三、适用场景


| 场景   | 示例用例                       |
| ---- | -------------------------- |
| 创意设计 | 海报、概念艺术、社交媒体视觉图            |
| 营销内容 | 产品广告、活动创意、Banner           |
| 文生图  | 通过 Prompt 生成产品图、插画、场景图、概念图 |
| 图像编辑 | 对象替换、背景更换、风格转换、局部改图        |
| 角色合成 | 将多个角色或参考图组合到同一场景中          |
| 视觉生产 | 为 App、网站、游戏和视频生成素材         |
| 电商   | 产品图优化、场景化产品图、营销主图          |
| 社交内容 | Meme、头像、缩略图、生活方式视觉图        |


---


## 四、API 基础信息


### Base URL


```plain text
https://apihub.agnes-ai.com
```


### Endpoint


```plain text
POST https://apihub.agnes-ai.com/v1/images/generations
```


### Headers


```bash
-H "Authorization: Bearer YOUR_API_KEY"
-H "Content-Type: application/json"
```


---


## 五、模型名称


```plain text
agnes-image-2.0-flash
```


| 模型                    | 用途                |
| --------------------- | ----------------- |
| agnes-image-2.0-flash | 文生图、图生图、多图合成、图像编辑 |


---


## 六、请求参数


| 参数                         | 类型       | 是否必填  | 说明                                    |
| -------------------------- | -------- | ----- | ------------------------------------- |
| model                      | string   | 是     | 模型名称，固定为 agnes-image-2.0-flash        |
| prompt                     | string   | 是     | 描述目标图像或编辑需求的文本提示词                     |
| size                       | string   | 是     | 输出图像尺寸，例如 1024x768、1024x1024、768x1024 |
| image                      | string[] | 图生图必填 | 输入图片数组，支持公网 URL 或 Data URI Base64     |
| return_base64              | boolean  | 否     | 文生图返回 Base64 时使用                      |
| extra_body.response_format | string   | 否     | 输出格式，常用 url 或 b64_json                |


---


## 七、重要说明


### 1. 文生图不需要传 `image`


文生图只需要传入：


```json
{
  "model": "agnes-image-2.0-flash",
  "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
  "size": "1024x768"
}
```


---


### 2. 图生图需要传 `image`


图生图或多图合成时，需要在顶层传入 `image` 数组：


```json
{
  "image": [
    "https://example.com/input.png"
  ]
}
```


多图合成时可以传入多个图片 URL：


```json
{
  "image": [
    "https://example.com/character-1.png",
    "https://example.com/character-2.png"
  ]
}
```


---


### 3. 图生图不需要传 `tags`


当前接入方式中，图生图请求不需要传：


```json
{
  "tags": ["img2img"]
}
```


只需要传入 `model`、`prompt`、`size` 和 `image`。


---


### 4. `response_format` 不要放在顶层


不要这样写：


```json
{
  "response_format": "url"
}
```


推荐写法：


```json
{
  "extra_body": {
    "response_format": "url"
  }
}
```


如果将 `response_format` 放在顶层，可能会返回 400 错误。


---


## 八、调用示例


### 1. 文生图：URL 输出


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
    "size": "1024x768",
    "extra_body": {
      "response_format": "url"
    }
  }'
```


生成图片 URL 位于：


```plain text
data[0].url
```


---


### 2. 文生图：Base64 输出


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
    "size": "1024x768",
    "return_base64": true
  }'
```


生成图片 Base64 位于：


```plain text
data[0].b64_json
```


---


### 3. 图生图：URL 输入，URL 输出


用于编辑或转换现有图像。


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Transform this image into a cinematic cyberpunk style while preserving the main subject and composition",
    "size": "1024x768",
    "extra_body": {
    "image": [
      "https://example.com/input-image.png"
    ],
      "response_format": "url"
    }
  }'
```


生成图片 URL 位于：


```plain text
data[0].url
```


---


### 4. 图生图：URL 输入，Base64 输出


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Make the object orange while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
    "image": [
      "https://example.com/input-image.png"
    ],
      "response_format": "b64_json"
    }
  }'
```


生成图片 Base64 位于：


```plain text
data[0].b64_json
```


---


### 5. 图生图：Data URI Base64 输入


如果输入图片不是公网 URL，也可以使用 Data URI Base64 作为输入。


Data URI 格式：


```plain text
data:image/png;base64,BASE64_HERE
```


请求示例：


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Make the object matte black while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
    "image": [
      "data:image/png;base64,BASE64_HERE"
    ],
      "response_format": "b64_json"
    }
  }'
```


---


### 6. 多图合成请求


用于将多张输入图像组合成一个新场景。


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Combine the two characters into an intense fantasy battle scene, dynamic lighting, detailed background, cinematic composition",
    "size": "1024x768",
    "extra_body": {
    "image": [
      "https://example.com/character-1.png",
      "https://example.com/character-2.png"
    ],
      "response_format": "url"
    }
  }'
```


---


## 九、响应格式


### 1. URL 输出


```json
{
  "created": 1780000000,
  "data": [
    {
      "url": "https://storage.googleapis.com/agnes-aigc/xxx.png",
      "b64_json": null,
      "revised_prompt": null
    }
  ]
}
```


### 2. Base64 输出


```json
{
  "created": 1780000000,
  "data": [
    {
      "url": null,
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",
      "revised_prompt": null
    }
  ]
}
```


---


## 十、响应字段说明


| 字段                    | 类型            | 说明                          |
| --------------------- | ------------- | --------------------------- |
| created               | integer       | 请求创建时间戳                     |
| data                  | array         | 生成图片结果列表                    |
| data[].url            | string / null | 生成图片 URL，Base64 输出时通常为 null |
| data[].b64_json       | string / null | Base64 图片数据，URL 输出时通常为 null |
| data[].revised_prompt | string / null | 修订后的 Prompt，如无则为 null       |


---


## 十一、价格


| 类型               | 原价             | 当前价格       |
| ---------------- | -------------- | ---------- |
| Generated Images | $0.003 / image | $0 / image |


---


## 十二、功能与兼容性


Agnes-Image-2.0-Flash 支持以下能力：

- 文生图生成
- 图生图编辑
- 多图输入与合成
- 基于 Prompt 的图像转换
- 稳定的风格与构图控制
- 支持公网 URL 图片输入
- 支持 Data URI Base64 图片输入
- 支持 URL 或 Base64 输出
- 面向生产工作流的快速生成
- 兼容 OpenAI Images API 的请求结构

---


## 十三、最佳实践


### 1. 文生图 Prompt 编写建议


为了获得更好的生成效果，建议在 Prompt 中提供清晰的视觉指令，包括主体、场景、风格、光照、构图和质量要求。


示例：


```plain text
A professional product photo of a wireless headphone on a clean white background, soft studio lighting, sharp details, commercial photography style
```


---


### 2. 图像编辑 Prompt 编写建议


对于编辑任务，建议明确描述需要改变的内容，以及需要保持不变的内容。


示例：


```plain text
Change the background to a futuristic city at night while keeping the person’s face, outfit, and pose unchanged
```


---


### 3. 多图合成 Prompt 编写建议


对于多图合成任务，建议描述不同输入图像之间的关系。


示例：


```plain text
Place the person from the first image beside the robot from the second image in a cinematic sci-fi battle scene
```


---


## 十四、推荐 Prompt 结构


### 文生图 Prompt 结构


```plain text
[Main subject] + [Scene / background] + [Style] + [Lighting] + [Composition] + [Quality requirements]
```


示例：


```plain text
A young explorer standing in an ancient temple, cinematic fantasy style, warm dramatic lighting, wide-angle composition, ultra detailed, high quality
```


### 图生图 Prompt 结构


```plain text
[Editing instruction] + [Elements to preserve] + [Target style / scene] + [Lighting] + [Composition] + [Quality requirements]
```


示例：


```plain text
Change the background into a cinematic fantasy temple while preserving the person’s face, outfit, and pose, warm dramatic lighting, wide-angle composition, ultra detailed, high quality
```


---


## 十五、常见问题


### 1. Agnes-Image-2.0-Flash 是否支持文生图？


支持。


文生图请求不需要传入 `image`，只需要传入 `model`、`prompt` 和 `size`。


---


### 2. Agnes-Image-2.0-Flash 是否支持图生图？


支持。


---


### 3. 输入图片 URL 不可访问怎么办？


如果输入图片 URL 不能被服务端访问，可能导致请求失败。


建议使用：

- 公网可访问的 HTTPS 图片地址
- Data URI Base64 输入

---


### 4. 请求超时怎么办？


图片生成可能需要数秒到几十秒。


客户端建议设置较长超时时间，例如：


```plain text
60s - 360s
```


---


## 十六、接入检查清单


接入前建议确认：

- 已获得有效 API Key
- 请求地址为 `https://apihub.agnes-ai.com/v1/images/generations`
- Header 中已添加 `Authorization: Bearer YOUR_API_KEY`
- Header 中已添加 `Content-Type: application/json`
- 模型名称为 `agnes-image-2.0-flash`
- `response_format` 放在 `extra_body` 中

识图模型：

# Agnes-2.0-Flash


**Agnes-2.0-Flash** 是由 **Sapiens AI** 开发的一款快速、高效的语言模型，面向智能体工作流、工具调用、编程任务、推理、多轮对话、图片理解以及高频生产环境应用场景设计。


Agnes-2.0-Flash 在 **Claw-Eval** 基准测试中取得了强劲表现，在 **General Leaderboard** 中排名第 **9**，**Pass^3 分数为 60.9%**，展现出在主流语言模型中较强的自主智能体能力。


---


## 模型概述


Agnes-2.0-Flash 针对快速、可靠、低成本的语言生成、智能体任务执行和图片理解进行了优化。


该模型支持以下能力：


| 能力              | 说明                                   |
| --------------- | ------------------------------------ |
| Chat Completion | 为对话和应用生成高质量回复                        |
| 多轮对话            | 在多轮交互中保持上下文连续性                       |
| 图片 URL 输入       | 支持通过公网图片 URL 传入图片内容                  |
| 图片理解            | 支持基于图片的内容理解、截图分析和信息提取                |
| 工具调用            | 调用外部工具和函数，支持智能体工作流                   |
| 智能体工作流          | 支持规划、执行和多步骤任务完成                      |
| 编程任务            | 辅助代码生成、调试、解释和重构                      |
| 推理              | 处理结构化推理、任务拆解和决策                      |
| 流式输出            | 实时返回响应，提升用户体验                        |
| OpenAI 兼容 API   | 使用兼容 OpenAI Chat Completions API 的结构 |


---


## 适用场景


Agnes-2.0-Flash 适用于以下场景：


| 场景      | 示例用例                   |
| ------- | ---------------------- |
| AI 助手   | 通用问答、日常助手、效率支持         |
| 自主智能体   | 多步骤任务执行、规划和工具使用        |
| 编程助手    | 代码生成、调试、重构和解释          |
| 工作流自动化  | 任务拆解、流程自动化和执行规划        |
| 客户支持    | FAQ 问答、客服聊天机器人、服务自动化   |
| 搜索与问答   | 基于搜索的回答、摘要生成、信息提取      |
| 内容生成    | 营销文案、文章、产品描述、脚本        |
| 开发者工具   | API 助手、文档助手、编程 Copilot |
| AI 原生应用 | 消费级应用、效率工具、智能体应用       |
| 图片理解    | 图片描述、截图分析、视觉问答、信息提取    |


---


## API 信息


### Endpoint


| 项目                    | 说明                                              |
| --------------------- | ----------------------------------------------- |
| API Endpoint          | https://apihub.agnes-ai.com/v1/chat/completions |
| Request Method        | POST                                            |
| Content-Type          | application/json                                |
| Authentication        | Bearer Token                                    |
| Authentication Header | Authorization: Bearer YOUR_API_KEY              |


---


## 请求参数


| 参数                   | 类型              | 是否必填 | 说明                                       |
| -------------------- | --------------- | ---- | ---------------------------------------- |
| model                | string          | 是    | 模型名称，固定为 agnes-2.0-flash                 |
| messages             | array           | 是    | 对话消息数组，包括 system、user 和 assistant 消息     |
| messages[].content   | string / array  | 是    | 消息内容。可为纯文本字符串，也可为包含 text、image_url 的内容数组 |
| temperature          | number          | 否    | 控制输出随机性。较低值会生成更确定性的结果                    |
| top_p                | number          | 否    | 控制核采样。较低值会使输出更加聚焦                        |
| max_tokens           | number          | 否    | 响应中最多生成的 token 数                         |
| stream               | boolean         | 否    | 是否启用流式响应输出                               |
| tools                | array           | 否    | 用于工具调用工作流的工具定义                           |
| tool_choice          | string / object | 否    | 控制模型是否以及如何使用工具                           |
| chat_template_kwargs | object          | 否    | OpenAI 兼容请求中用于开启 Thinking 等扩展能力          |
| thinking             | object          | 否    | Anthropic 兼容请求中用于开启 Thinking 模式          |


---


## 图片 URL 输入支持


Agnes-2.0-Flash 支持通过图片 URL 输入图片内容。开发者可以在同一个 `messages` 请求中同时传入文本指令和图片 URL，让模型基于图片进行理解、分析、问答或信息提取。


支持的输入类型包括：


| 输入类型   | 支持方式      | 说明               |
| ------ | --------- | ---------------- |
| 文本     | text      | 普通文本指令或问题        |
| 图片 URL | image_url | 通过公网可访问的图片链接传入图片 |


### 图片内容结构


当使用图片 URL 输入时，`messages[].content` 应使用数组结构，每个内容块代表一种输入内容。


```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "Describe the content of this image."
    },
    {
      "type": "image_url",
      "image_url": {
        "url": "https://example.com/image.jpg"
      }
    }
  ]
}
```


---


## 调用示例


### 1. 基础 Chat Completion 请求


用于生成普通的聊天补全响应。


```bash
curl https://apihub.agnes-ai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-2.0-flash",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful AI assistant."
      },
      {
        "role": "user",
        "content": "Explain how autonomous agents use tools to complete tasks."
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```


---


### 2. 流式输出请求


用于启用流式输出。


```bash
curl https://apihub.agnes-ai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-2.0-flash",
    "messages": [
      {
        "role": "user",
        "content": "Write a short product introduction for an AI assistant app."
      }
    ],
    "stream": true
  }'
```


---


### 3. 工具调用请求


用于需要外部工具调用的智能体工作流。


```bash
curl https://apihub.agnes-ai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-2.0-flash",
    "messages": [
      {
        "role": "user",
        "content": "What is the weather like in Singapore today?"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "The city and country"
              }
            },
            "required": ["location"]
          }
        }
      }
    ]
  }'
```


---


### 4. 图片 URL 输入请求


用于通过图片链接传入图片，并让模型理解或分析图片内容。


```bash
curl https://apihub.agnes-ai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-2.0-flash",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Describe the content of this image."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.jpg"
            }
          }
        ]
      }
    ]
  }'
```


---


## 响应格式


```json
{
  "id": "chatcmpl_xxx",
  "object": "chat.completion",
  "created": 1774432125,
  "model": "agnes-2.0-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Autonomous agents use tools by understanding the user's goal, breaking it into steps, selecting the right tools, executing actions, and using the results to complete the task."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 58,
    "total_tokens": 93
  }
}
```


---


## 响应字段说明


| 字段                        | 类型      | 说明                       |
| ------------------------- | ------- | ------------------------ |
| id                        | string  | 本次补全请求的唯一 ID             |
| object                    | string  | 对象类型，通常为 chat.completion |
| created                   | integer | 请求时间戳                    |
| model                     | string  | 本次请求使用的模型                |
| choices                   | array   | 生成的响应结果列表                |
| choices[].index           | integer | 响应结果的索引                  |
| choices[].message         | object  | Assistant 消息对象           |
| choices[].message.role    | string  | 消息发送者角色                  |
| choices[].message.content | string  | 模型生成的响应内容                |
| choices[].finish_reason   | string  | 生成停止原因                   |
| usage                     | object  | Token 使用信息               |
| usage.prompt_tokens       | integer | 输入 token 数量              |
| usage.completion_tokens   | integer | 输出 token 数量              |
| usage.total_tokens        | integer | 使用的 token 总数             |


---


## 为编码任务启用 Thinking


对于代码编写、调试、推理和 Agent 工作流，建议开启 Thinking 模式，以提升代码质量、任务拆解能力和问题解决效果。


### OpenAI 兼容请求


使用 OpenAI 兼容 API 格式时，在请求体中添加 `chat_template_kwargs.enable_thinking`：


```json
{
  "model": "agnes-2.0-flash",
  "messages": [
    {
      "role": "user",
      "content": "Help me write a Python script to process a CSV file."
    }
  ],
  "chat_template_kwargs": {
    "enable_thinking": true
  }
}
```


### Anthropic 兼容请求


使用 Anthropic 兼容 API 格式时，在请求体中添加 `thinking` 字段：


```json
{
  "model": "agnes-2.0-flash",
  "messages": [
    {
      "role": "user",
      "content": "Help me refactor this TypeScript function and explain the changes."
    }
  ],
  "thinking": {
    "type": "enabled",
    "budget_tokens": 2048
  }
}
```


`budget_tokens` 用于控制最大 Thinking token 预算。对于常见编码任务，建议从 `2048` 开始设置。对于更复杂的调试、重构或多步骤 Agent 任务，可以根据需要适当提高该值。


---


## 功能与兼容性


Agnes-2.0-Flash 支持以下能力：

- Chat Completion
- 多轮对话
- System Prompt
- 图片 URL 输入
- 图片理解
- 流式输出
- 工具调用
- 智能体工作流
- 编程任务
- 推理任务
- JSON 风格输出
- 兼容 OpenAI Chat Completions API 的请求结构

---


## 最佳实践


### Prompt 编写建议


为了获得更好的结果，建议提供清晰的指令、上下文和期望的输出格式。


### 示例：产品文案生成


```plain text
You are a product marketing expert. Write a concise App Store description for an AI assistant app. The tone should be clear, professional, and user-friendly.
```


### 示例：编程任务


对于编程任务，建议提供编程语言、框架、错误信息和期望行为。


```plain text
Help me debug this React component. The issue is that the button state does not update after clicking. Explain the cause and provide the corrected code.
```


### 示例：智能体工作流


对于智能体工作流，建议清晰描述目标、可用工具和任务约束。


```plain text
You are an autonomous research agent. Search for relevant information, summarize the key findings, and return the result in a structured format with source links.
```


### 示例：图片理解任务


对于图片理解任务，建议明确说明希望模型关注的内容，例如整体描述、文字提取、界面分析、物体识别或结构化输出。


```plain text
Analyze this screenshot. Identify the main UI elements, explain the possible issue, and provide suggestions to improve the user experience.
```


---


## 推荐 Prompt 结构


建议使用以下结构组织 Prompt：


```plain text
[Role] + [Task] + [Context] + [Requirements] + [Output Format]
```


### 示例


```plain text
You are a senior product manager. Analyze this feature idea for an AI assistant app. Consider user value, implementation complexity, risks, and return the result in a structured table.
```


### 图片理解 Prompt 示例


```plain text
You are an image analysis assistant. Analyze the provided image URL, summarize the key information, identify potential issues, and return the result in a structured table.
```


---


## 图片 URL 使用建议

- 图片 URL 必须可公网访问。
- 如果图片 URL 需要登录、鉴权或存在防盗链，模型可能无法读取。
- 建议使用标准图片格式，例如 JPG、JPEG、PNG 或 WebP。
- 对于截图、报错图、产品界面图，建议在文本中补充你希望模型重点关注的问题。
- 图片 URL 输入可以与工具调用、流式输出和 Agent 工作流结合使用。

---


## 模型限制


| 项目         | 数值    |
| ---------- | ----- |
| Context    | 256K  |
| Max Output | 65.5K |


---


## 价格


| 类型            | 价格                | 现价             |
| ------------- | ----------------- | -------------- |
| Input Tokens  | $0.03 / 1M tokens | $0 / 1M tokens |
| Output Tokens | $0.15 / 1M tokens | $0 / 1M tokens |


---


## 说明

- 使用 `agnes-2.0-flash` 作为模型名称。
- 基础 Chat Completion 请求必须包含 `model` 和 `messages`。
- `messages[].content` 可使用纯文本字符串，也可使用包含文本和图片 URL 的内容数组。
- 如需输入图片，请使用 `image_url` 并提供公网可访问的图片 URL。
- 如需启用流式响应，请将 `stream` 设置为 `true`。
- 对于工具调用工作流，请提供 `tools`，并可按需提供 `tool_choice`。
- `temperature` 用于控制随机性。较低值更适合确定性任务，较高值更适合创意生成。
- Agnes-2.0-Flash 适合需要快速响应、强任务完成能力、图片理解能力和可靠智能体表现的生产级应用。


视频模型：
# Agnes-Video-V2.0 API 接入指南


## 概述


Agnes-Video-V2.0 是一款面向生产环境的视频生成模型，支持 **文生视频**、**图生视频**、**多图视频生成** 和 **关键帧动画** 工作流。


开发者可以通过文本提示词、图片 URL 或多张参考图片生成高质量视频。该模型适用于故事创作、营销视频、产品演示、社交媒体内容、App 动态素材以及 AI 创意工作流。


Agnes-Video-V2.0 采用异步任务式 API。你需要先创建视频生成任务，然后使用返回的 `video_id` 或 `task_id` 查询视频结果。


---


## 支持能力


| 能力     | 说明                    |
| ------ | --------------------- |
| 文生视频   | 根据文本提示词直接生成视频         |
| 图生视频   | 将静态图片动画化为动态视频         |
| 多图视频生成 | 使用多张参考图片指导视频生成        |
| 关键帧动画  | 在多个关键帧之间生成平滑过渡        |
| 场景运动控制 | 通过提示词控制主体动作、镜头运动和场景动态 |
| 视觉一致性  | 在多帧之间保持主体、风格和场景一致     |
| 电影级输出  | 生成高质量电影级视频            |
| 异步 API | 先提交任务，再查询生成结果         |


---


## 适用场景


| 场景          | 示例                       |
| ----------- | ------------------------ |
| 故事创作        | 短片、角色场景、叙事片段             |
| 营销视频        | 产品广告、活动视频、推广内容           |
| 社交媒体内容      | Reels、Shorts、TikTok 风格视频 |
| 图像动画化       | 动画化人像、产品、角色或场景           |
| 产品演示        | 根据文本或图像生成产品展示视频          |
| 关键帧过渡       | 在不同视觉状态之间生成平滑转场          |
| 游戏 / App 素材 | 为数字产品生成动态视觉素材            |
| 沉浸式内容       | 生成电影级 AI 场景和氛围视频         |


---


## 准备工作


开始接入前，请确保你已经具备以下条件：

1. 已获得有效的 Agnes AI API Key。
2. 当前网络环境可以访问 Agnes AI API Gateway。
3. 已确认模型名称：`agnes-video-v2.0`。
4. 已准备好视频生成所需的文本提示词。
5. 如需使用图生视频、多图视频或关键帧动画，请准备可公网访问的图片 URL。

---


## API Endpoints


### 创建视频任务


| 项目             | 说明                                    |
| -------------- | ------------------------------------- |
| Endpoint       | https://apihub.agnes-ai.com/v1/videos |
| Method         | POST                                  |
| Content-Type   | application/json                      |
| Authentication | Bearer Token                          |
| Header         | Authorization: Bearer YOUR_API_KEY    |


---


### 查询视频结果：推荐方式


创建视频任务后，响应中会返回 `video_id`。


推荐使用 `video_id` 查询视频结果。


| 项目             | 说明                                                       |
| -------------- | -------------------------------------------------------- |
| Endpoint       | https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID> |
| Method         | GET                                                      |
| Authentication | Bearer Token                                             |
| Header         | Authorization: Bearer YOUR_API_KEY                       |


---


### 查询视频结果：兼容旧方式


旧版任务查询接口仍然支持，用于兼容已有接入逻辑。


| 项目             | 说明                                              |
| -------------- | ----------------------------------------------- |
| Endpoint       | https://apihub.agnes-ai.com/v1/videos/{task_id} |
| Method         | GET                                             |
| Authentication | Bearer Token                                    |
| Header         | Authorization: Bearer YOUR_API_KEY              |


---


## 请求参数


### 创建视频任务参数


| 参数                  | 类型             | 是否必填 | 说明                         |
| ------------------- | -------------- | ---- | -------------------------- |
| model               | string         | 是    | 模型名称，使用 agnes-video-v2.0   |
| prompt              | string         | 是    | 视频内容的文本描述                  |
| image               | string / array | 否    | 图片 URL 或图片 URL 数组          |
| mode                | string         | 否    | 生成模式，例如 ti2vid 或 keyframes |
| height              | integer        | 否    | 视频高度，默认值为 768              |
| width               | integer        | 否    | 视频宽度，默认值为 1152             |
| num_frames          | integer        | 否    | 视频帧数，必须 ≤ 441，且满足 8n + 1   |
| frame_rate          | number         | 否    | 视频 FPS，支持范围为 1–60          |
| num_inference_steps | integer        | 否    | 推理步数                       |
| seed                | integer        | 否    | 随机种子，用于保证结果可复现             |
| negative_prompt     | string         | 否    | 负向提示词，用于描述需要避免的内容          |
| extra_body.image    | array          | 否    | 多图视频或关键帧模式中的输入图片 URL       |
| extra_body.mode     | string         | 否    | 额外模式设置，例如 keyframes        |


---


### 参数标准化说明


Agnes-Video-V2.0 会对部分视频生成参数进行标准化处理，以保证生成稳定性和输出一致性。当开发者传入的 `width`、`height` 或宽高比不完全匹配模型支持的标准规格时，系统会自动识别最接近的分辨率档位和宽高比，并映射为对应的标准输出尺寸。


当前模型支持 `480p`、`720p` 和 `1080p` 三个标准分辨率档位，推荐使用以下宽高比：


| 宽高比  | 推荐场景                                     |
| ---- | ---------------------------------------- |
| 16:9 | 横屏视频、产品演示、官网展示、YouTube 风格内容              |
| 9:16 | 竖屏短视频、移动端内容、TikTok / Reels / Shorts 风格内容 |
| 1:1  | 方形视频、社交媒体 Feed、角色或商品展示                   |
| 4:3  | 传统横向画幅、通用展示内容                            |
| 3:4  | 竖向展示、人物或商品主体突出的视频内容                      |


不同分辨率和宽高比会对应不同的实际输出尺寸和最大帧数限制。例如，接近 `720p / 16:9` 的输入尺寸会被标准化为对应的标准输出尺寸。


因此，请求中的原始 `width`、`height`、`num_frames` 等参数可能与实际执行时的标准参数不完全一致。开发者在展示任务信息、计算视频时长或排查生成问题时，应以接口返回结果中的 `size`、`seconds` 等字段为准。


---


## 创建视频任务


### 示例 1：文生视频


用于直接根据文本提示词生成视频。


```bash
curl -X POST https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "A cinematic shot of a cat walking on the beach at sunset, soft ocean waves, warm golden lighting, realistic motion",
    "height": 768,
    "width": 1152,
    "num_frames": 121,
    "frame_rate": 24
  }'
```


---


### 示例 2：图生视频


用于将单张图片动画化。


```bash
curl -X POST https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "The woman slowly turns around and looks back at the camera, natural facial expression, cinematic camera movement",
    "image": "https://example.com/image.png",
    "num_frames": 121,
    "frame_rate": 24
  }'
```


---


### 示例 3：多图视频生成


用于通过多张输入图片指导视频生成。


```bash
curl -X POST https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "Create a smooth transformation scene between the two reference images, cinematic lighting, consistent character identity, natural motion",
    "extra_body": {
      "image": [
        "https://example.com/image1.png",
        "https://example.com/image2.png"
      ]
    },
    "num_frames": 121,
    "frame_rate": 24
  }'
```


---


### 示例 4：关键帧动画


用于在多个关键帧之间生成平滑动画。


```bash
curl -X POST https://apihub.agnes-ai.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "Generate a smooth cinematic transition between the keyframes, maintaining visual consistency and natural camera movement",
    "extra_body": {
      "image": [
        "https://example.com/keyframe1.png",
        "https://example.com/keyframe2.png"
      ],
      "mode": "keyframes"
    },
    "num_frames": 121,
    "frame_rate": 24
  }'
```


---


## 创建任务响应


视频任务创建成功后，API 会返回任务信息。


响应中会同时包含 `task_id` 和 `video_id`。


其中，`video_id` 是推荐用于查询视频结果的 ID。


```json
{
  "id": "task_YOUR_TASK_ID",
  "task_id": "task_YOUR_TASK_ID",
  "video_id": "video_YOUR_VIDEO_ID",
  "object": "video",
  "model": "agnes-video-v2.0",
  "status": "queued",
  "progress": 0,
  "created_at": 1780457477,
  "seconds": "10.0",
  "size": "1280x768"
}
```


### 响应字段说明


| 字段         | 类型      | 说明               |
| ---------- | ------- | ---------------- |
| id         | string  | 任务 ID，可用于旧版查询接口  |
| task_id    | string  | 任务 ID，作用与 id 相同  |
| video_id   | string  | 视频 ID，推荐用于查询视频结果 |
| object     | string  | 对象类型，通常为 video   |
| model      | string  | 当前任务使用的模型        |
| status     | string  | 当前任务状态           |
| progress   | integer | 当前任务进度百分比        |
| created_at | integer | 任务创建时间戳          |
| seconds    | string  | 视频时长，单位为秒        |
| size       | string  | 视频分辨率            |


---


## 查询视频结果


### 推荐方式：使用 `video_id` 查询


创建视频任务后，使用返回的 `video_id` 查询视频结果。建议轮询间隔5s。


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>' \
  --header 'Authorization: Bearer <API_KEY>'
```


示例：


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/agnesapi?video_id=video_xxxxxx' \
  --header 'Authorization: Bearer <API_KEY>'
```


---


### 可选参数：`model_name`


查询视频结果时，也可以传入 `model_name` 显式指定模型名。


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>&model_name=<MODEL>' \
  --header 'Authorization: Bearer <API_KEY>'
```


示例：


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/agnesapi?video_id=video_xxxxxx&model_name=agnes-video-v2.0' \
  --header 'Authorization: Bearer <API_KEY>'
```


---


### 兼容方式：使用 `task_id` 查询


为了兼容旧版本，仍然可以使用 `task_id` 查询视频结果。


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/v1/videos/<TASK_ID>' \
  --header 'Authorization: Bearer <API_KEY>'
```


示例：


```bash
curl --location --request GET 'https://apihub.agnes-ai.com/v1/videos/task_xxxxxx' \
  --header 'Authorization: Bearer <API_KEY>'
```


该方式仍然支持，但新的接入建议使用 `video_id` 查询方式。


---


## 查询结果响应


当任务完成后，API 会返回最终视频结果。


```json
{
  "id": "task_YOUR_TASK_ID",
  "video_id": "video_YOUR_VIDEO_ID",
  "model": "agnes-video-v2.0",
  "object": "video",
  "status": "completed",
  "progress": 100,
  "seconds": "10.0",
  "size": "1280x768",
  "remixed_from_video_id": "https://storage.googleapis.com/agnes-aigc/aigc/videos/2026/06/03/video_xxxxxx.mp4",
  "error": null
}
```


### 结果字段说明


| 字段                    | 类型            | 说明                                        |
| --------------------- | ------------- | ----------------------------------------- |
| id                    | string        | 任务 ID                                     |
| video_id              | string        | 视频 ID                                     |
| model                 | string        | 当前任务使用的模型                                 |
| object                | string        | 对象类型                                      |
| status                | string        | 任务状态                                      |
| progress              | integer       | 任务进度百分比                                   |
| seconds               | string        | 视频时长，单位为秒                                 |
| size                  | string        | 视频分辨率                                     |
| remixed_from_video_id | string        | 本字段为最终生成的视频 URL，仅在 status 为 completed 时可用 |
| error                 | object / null | 错误信息，任务失败时返回                              |


---


## 任务状态说明


| 状态          | 说明        |
| ----------- | --------- |
| queued      | 任务正在队列中等待 |
| in_progress | 视频正在生成中   |
| completed   | 视频已生成完成   |
| failed      | 视频生成失败    |


---


## 视频时长控制


Agnes-Video-V2.0 支持通过 `num_frames` 和 `frame_rate` 控制视频时长。


计算公式：


```plain text
seconds = num_frames / frame_rate
```


其中：

- `num_frames` 表示生成的视频总帧数；
- `frame_rate` 表示视频帧率，即每秒播放多少帧；
- `num_frames` 必须小于或等于 `441`；
- `num_frames` 必须满足 `8n + 1`；
- `frame_rate` 支持范围为 `1–60`。

### 常用时长参数


| 目标时长   | 推荐参数                            |
| ------ | ------------------------------- |
| 约 3 秒  | num_frames: 81, frame_rate: 24  |
| 约 5 秒  | num_frames: 121, frame_rate: 24 |
| 约 10 秒 | num_frames: 241, frame_rate: 24 |
| 约 18 秒 | num_frames: 441, frame_rate: 24 |


如果希望生成更长的视频，可以增加 `num_frames` 或降低 `frame_rate`。


如果希望画面更流畅，可以使用更高的 `frame_rate`，例如 `24` 或 `30`。但在相同 `num_frames` 下，`frame_rate` 越高，视频时长越短。


---


## 推荐参数


| 使用场景     | 推荐设置                                                      |
| -------- | --------------------------------------------------------- |
| 标准视频生成   | width: 1152, height: 768, num_frames: 121, frame_rate: 24 |
| 短视频社交内容  | num_frames: 81 或 121, frame_rate: 24                      |
| 更长视频     | 增加 num_frames 或降低 frame_rate                              |
| 更平滑运动    | 使用 frame_rate: 24 或 30                                    |
| 可复现结果    | 设置固定 seed                                                 |
| 关键帧过渡    | 使用 extra_body.mode: "keyframes"                           |
| 避免不需要的内容 | 使用 negative_prompt                                        |


---


## Prompt 最佳实践


### 文生视频 Prompt


文生视频任务建议描述主体、动作、环境、镜头运动、光照和视觉风格。


推荐结构：


```plain text
[主体] + [动作] + [场景] + [镜头运动] + [光照] + [风格]
```


示例：


```plain text
A young astronaut walking across a red desert planet, dust blowing in the wind, slow cinematic tracking shot, dramatic sunset lighting, realistic sci-fi style
```


---


### 图生视频 Prompt


图生视频任务建议描述哪些内容需要运动，同时说明哪些主体元素需要保持稳定。


示例：


```plain text
Animate the character with subtle breathing motion, hair moving gently in the wind, background lights flickering softly, while keeping the face and outfit consistent
```


---


### 多图视频 Prompt


多图视频任务建议描述输入图片之间的关系，以及画面如何过渡。


示例：


```plain text
Use the first image as the starting scene and the second image as the target scene. Create a smooth transformation with consistent lighting, natural motion, and cinematic pacing
```


---


### 关键帧动画 Prompt


关键帧动画任务建议清晰描述关键帧之间的过渡关系。


示例：


```plain text
Create a smooth transition from the first keyframe to the second keyframe, maintaining character identity, consistent camera angle, and natural motion between scenes
```


---


## 错误码


| 状态码 | 说明              |
| --- | --------------- |
| 400 | 请求无效，请检查请求参数    |
| 401 | 未授权，请检查 API Key |
| 404 | 任务或视频不存在        |
| 500 | 服务器错误           |
| 503 | 服务繁忙，请稍后重试      |


---


## 价格


| 类型             | 标准价格            | 当前价格        |
| -------------- | --------------- | ----------- |
| Video Duration | $0.005 / second | $0 / second |


---


## 注意事项

- 使用 `agnes-video-v2.0` 作为模型名称；
- 视频生成是异步任务；
- 需要先创建视频任务，再查询视频结果；
- 创建任务响应中会同时返回 `task_id` 和 `video_id`；
- 新接入建议使用 `video_id` 查询视频结果；
- 旧版 `task_id` 查询接口仍然支持；
- `video_url` 仅在 `status` 为 `completed` 时可用；
- `num_frames` 必须小于或等于 `441`；
- `num_frames` 必须满足 `8n + 1`，例如 `81`、`121`、`161`、`241` 或 `441`；
- 文生视频任务仅要求传入 `model` 和 `prompt`；
- 图生视频任务需要通过 `image` 提供图片 URL；
- 多图视频任务需要在 `extra_body.image` 中提供多个图片 URL；
- 关键帧动画需要设置 `extra_body.mode` 为 `keyframes`。