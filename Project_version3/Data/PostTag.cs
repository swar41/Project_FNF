﻿using System;
using System.Collections.Generic;

namespace Project_Version1.Data;

public partial class PostTag
{
    public int PostTagId { get; set; }

    public int PostId { get; set; }

    public int TagId { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual Tag Tag { get; set; } = null!;
}
